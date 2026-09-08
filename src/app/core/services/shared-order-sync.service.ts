import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap, switchMap } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface SharedOrder {
  id: string;
  orderNumber?: string | null;
  customerName?: string | null;
  userEmail?: string | null;
  phoneNumber?: string | null;
  shippingAddress?: string | null;
  totalAmount?: number;
  status?: any;
  createdAt?: string;
  paymentMethod?: string | null;
  orderItems?: any[] | null;
  [key: string]: any;
}

export interface SharedContractRequest {
  id: string;
  authorName: string;
  email: string;
  bookTitle: string;
  summary?: string;
  fileName?: string;
  cvFileName?: string;
  date: string;
  createdAt?: string;
  status: string;
}

export interface SharedContactMessage {
  id: string;
  senderName: string;
  email: string;
  subject: string;
  message?: string;
  type: string;
  date: string;
  createdAt?: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class SharedOrderSyncService {
  private readonly http = inject(HttpClient);

  private readonly ORDERS_KEY = 'elwasl_admin_mock_orders';
  private readonly CONTRACTS_KEY = 'elwasl_contract_requests';
  private readonly MESSAGES_KEY = 'elwasl_contact_messages';
  private readonly PAYMENTS_KEY = 'elwasl_admin_mock_payments';

  private syncToken: string | null = null;
  private tokenExpiry: number = 0;

  // ==========================================
  // BACKEND SYNC AUTHENTICATION
  // ==========================================

  private getBackendToken(): Observable<string | null> {
    if (this.syncToken && Date.now() < this.tokenExpiry) {
      return of(this.syncToken);
    }
    return this.http.post<any>(`${API_CONFIG.baseUrl}/api/v1/Auth/login`, {
      email: 'sync@el-wasl.com',
      password: 'SyncPassword123!'
    }).pipe(
      map(res => {
        if (res && res.accessToken) {
          this.syncToken = res.accessToken;
          this.tokenExpiry = Date.now() + 3600 * 1000;
          return res.accessToken;
        }
        return null;
      }),
      catchError(() => of(null))
    );
  }

  // ==========================================
  // ORDERS
  // ==========================================

  getOrders(): Observable<SharedOrder[]> {
    return this.getBackendToken().pipe(
      switchMap(token => {
        const local = this.getLocalOrders();
        if (!token) {
          this.syncPaymentsFromOrders(local);
          return of(local);
        }

        return this.http.get<any>(`${API_CONFIG.baseUrl}/api/v1/Orders?pageNumber=1&pageSize=100`, {
          headers: { Authorization: `Bearer ${token}` }
        }).pipe(
          map(res => {
            const serverOrders: SharedOrder[] = (res && Array.isArray(res.items)) ? res.items.map((item: any) => ({
              id: item.id,
              orderNumber: item.orderNumber,
              customerName: item.customerName || 'عميل دار الوصل',
              userEmail: item.userEmail || '',
              phoneNumber: item.phoneNumber || '',
              shippingAddress: item.shippingAddress || '',
              totalAmount: item.totalAmount || 0,
              status: item.status || 'Pending',
              createdAt: item.createdAt || new Date().toISOString(),
              paymentMethod: item.paymentMethod || 'Cash on Delivery',
              orderItems: item.orderItems || []
            })) : [];

            // Merge server and local orders without duplicates
            const serverIds = new Set(serverOrders.map(o => o.id));
            const serverNumbers = new Set(serverOrders.map(o => o.orderNumber).filter(Boolean));

            const localOnly = local.filter(l => !serverIds.has(l.id) && (!l.orderNumber || !serverNumbers.has(l.orderNumber)));
            const combined = [...localOnly, ...serverOrders];

            combined.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

            if (combined.length > 0) {
              this.saveLocalOrders(combined);
              this.syncPaymentsFromOrders(combined);
            }
            return combined;
          }),
          catchError(() => {
            this.syncPaymentsFromOrders(local);
            return of(local);
          })
        );
      }),
      catchError(() => {
        const local = this.getLocalOrders();
        this.syncPaymentsFromOrders(local);
        return of(local);
      })
    );
  }

  saveOrder(order: SharedOrder): Observable<void> {
    const local = this.getLocalOrders();
    const existingIdx = local.findIndex(o => o.id === order.id || (o.orderNumber && o.orderNumber === order.orderNumber));
    if (existingIdx === -1) {
      local.unshift(order);
    } else {
      local[existingIdx] = order;
    }
    this.saveLocalOrders(local);
    this.savePaymentRecord(order);

    // Also persist to real backend if items exist
    if (order.orderItems && order.orderItems.length > 0) {
      return this.getBackendToken().pipe(
        switchMap(token => {
          if (!token) return of(void 0);
          const payload = {
            items: order.orderItems!.map(i => ({
              productType: i.productType !== undefined ? i.productType : 0,
              productId: i.productId,
              quantity: i.quantity || 1
            })),
            shippingAddressId: null
          };
          return this.http.post<any>(`${API_CONFIG.baseUrl}/api/v1/Orders`, payload, {
            headers: { Authorization: `Bearer ${token}` }
          }).pipe(
            map(() => void 0),
            catchError(() => of(void 0))
          );
        }),
        catchError(() => of(void 0))
      );
    }

    return of(void 0);
  }

  updateOrderStatus(orderId: string, status: any): Observable<void> {
    const local = this.getLocalOrders();
    const found = local.find(o => o.id === orderId || o.orderNumber === orderId);
    if (found) {
      found.status = status;
      this.saveLocalOrders(local);
    }
    return of(void 0);
  }

  getLocalOrders(): SharedOrder[] {
    try {
      const raw = localStorage.getItem(this.ORDERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  }

  private saveLocalOrders(orders: SharedOrder[]): void {
    try {
      localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
      this.triggerLocalSync();
    } catch {}
  }

  // ==========================================
  // CONTRACT REQUESTS
  // ==========================================

  getContracts(): Observable<SharedContractRequest[]> {
    return of(this.getLocalContracts());
  }

  saveContract(contract: SharedContractRequest): Observable<void> {
    const local = this.getLocalContracts();
    const existingIdx = local.findIndex(c => c.id === contract.id);
    if (existingIdx === -1) {
      local.unshift(contract);
    } else {
      local[existingIdx] = contract;
    }
    this.saveLocalContracts(local);
    return of(void 0);
  }

  updateContractStatus(contractId: string, status: string): Observable<void> {
    const local = this.getLocalContracts();
    const found = local.find(c => c.id === contractId);
    if (found) {
      found.status = status;
      this.saveLocalContracts(local);
    }
    return of(void 0);
  }

  getLocalContracts(): SharedContractRequest[] {
    try {
      const raw = localStorage.getItem(this.CONTRACTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  }

  private saveLocalContracts(contracts: SharedContractRequest[]): void {
    try {
      localStorage.setItem(this.CONTRACTS_KEY, JSON.stringify(contracts));
      this.triggerLocalSync();
    } catch {}
  }

  // ==========================================
  // CONTACT MESSAGES
  // ==========================================

  getMessages(): Observable<SharedContactMessage[]> {
    return of(this.getLocalMessages());
  }

  saveMessage(message: SharedContactMessage): Observable<void> {
    const local = this.getLocalMessages();
    const existingIdx = local.findIndex(m => m.id === message.id);
    if (existingIdx === -1) {
      local.unshift(message);
    } else {
      local[existingIdx] = message;
    }
    this.saveLocalMessages(local);

    // Forward to real backend Contact API
    return this.http.post<any>(`${API_CONFIG.baseUrl}/api/v1/Contact`, {
      name: message.senderName,
      email: message.email,
      subject: message.subject,
      message: message.message || message.subject
    }).pipe(
      map(() => void 0),
      catchError(() => of(void 0))
    );
  }

  updateMessageStatus(messageId: string, status: string): Observable<void> {
    const local = this.getLocalMessages();
    const found = local.find(m => m.id === messageId);
    if (found) {
      found.status = status;
      this.saveLocalMessages(local);
    }
    return of(void 0);
  }

  getLocalMessages(): SharedContactMessage[] {
    try {
      const raw = localStorage.getItem(this.MESSAGES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  }

  private saveLocalMessages(messages: SharedContactMessage[]): void {
    try {
      localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(messages));
      this.triggerLocalSync();
    } catch {}
  }

  // ==========================================
  // PAYMENTS
  // ==========================================

  savePaymentRecord(order: SharedOrder): void {
    try {
      const raw = localStorage.getItem(this.PAYMENTS_KEY);
      let payments = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(payments)) payments = [];

      const orderRef = order.orderNumber || order.id;
      const existing = payments.find((p: any) => p.orderId === orderRef);
      if (existing) return;

      const isCash = !order.paymentMethod || order.paymentMethod.toLowerCase().includes('cash');
      const randSuffix = Math.floor(100000 + Math.random() * 900000);

      const paymentRecord = {
        transactionId: `txn-${isCash ? 'cod' : 'card'}-${randSuffix}`,
        orderId: orderRef,
        amount: order.totalAmount || 0,
        gateway: isCash ? 'Cash on Delivery' : 'Stripe',
        status: isCash ? 'pending' : 'completed',
        customerName: order.customerName,
        createdAt: order.createdAt || new Date().toISOString()
      };

      payments.unshift(paymentRecord);
      localStorage.setItem(this.PAYMENTS_KEY, JSON.stringify(payments));
      this.triggerLocalSync();
    } catch {}
  }

  syncPaymentsFromOrders(orders: SharedOrder[]): void {
    try {
      const raw = localStorage.getItem(this.PAYMENTS_KEY);
      let payments = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(payments)) payments = [];

      const existingOrderIds = new Set(payments.map((p: any) => p.orderId));
      let added = false;

      orders.forEach(order => {
        const orderRef = order.orderNumber || order.id;
        if (!existingOrderIds.has(orderRef)) {
          const isCash = !order.paymentMethod || order.paymentMethod.toLowerCase().includes('cash');
          const randSuffix = Math.floor(100000 + Math.random() * 900000);
          payments.unshift({
            transactionId: `txn-${isCash ? 'cod' : 'card'}-${randSuffix}`,
            orderId: orderRef,
            amount: order.totalAmount || 0,
            gateway: isCash ? 'Cash on Delivery' : 'Stripe',
            status: isCash ? 'pending' : 'completed',
            customerName: order.customerName || 'عميل دار الوصل',
            createdAt: order.createdAt || new Date().toISOString()
          });
          existingOrderIds.add(orderRef);
          added = true;
        }
      });

      if (added) {
        localStorage.setItem(this.PAYMENTS_KEY, JSON.stringify(payments));
      }
    } catch {}
  }

  // ==========================================
  // HELPERS
  // ==========================================

  private triggerLocalSync(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      try {
        const channel = new BroadcastChannel('elwasl_orders_channel');
        channel.postMessage({ type: 'DATA_SYNC' });
        channel.close();
      } catch {}
    }
  }
}
