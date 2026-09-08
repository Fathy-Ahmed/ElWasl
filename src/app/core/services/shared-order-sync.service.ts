import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';

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

export interface CloudStorePayload {
  orders: SharedOrder[];
  contracts?: SharedContractRequest[];
  messages?: SharedContactMessage[];
  payments?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class SharedOrderSyncService {
  private readonly http = inject(HttpClient);
  private readonly CLOUD_STORE_URL = 'https://api.restful-api.dev/objects/ff808181a067127101a0809181894857';

  private readonly ORDERS_KEY = 'elwasl_admin_mock_orders';
  private readonly CONTRACTS_KEY = 'elwasl_contract_requests';
  private readonly MESSAGES_KEY = 'elwasl_contact_messages';
  private readonly PAYMENTS_KEY = 'elwasl_admin_mock_payments';

  // ==========================================
  // ORDERS
  // ==========================================

  getOrders(): Observable<SharedOrder[]> {
    return this.http.get<any>(this.CLOUD_STORE_URL).pipe(
      map(res => {
        const cloudOrders: SharedOrder[] = (res && res.data && Array.isArray(res.data.orders)) ? res.data.orders : [];
        const localOrders = this.getLocalOrders();

        const cloudIds = new Set(cloudOrders.map(o => o.id));
        const cloudNumbers = new Set(cloudOrders.map(o => o.orderNumber).filter(Boolean));

        const localOnly = localOrders.filter(l => !cloudIds.has(l.id) && (!l.orderNumber || !cloudNumbers.has(l.orderNumber)));
        const combined = [...localOnly, ...cloudOrders];

        // Sort descending by date
        combined.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        // Cache back locally
        if (combined.length > 0) {
          this.saveLocalOrders(combined);
          this.syncPaymentsFromOrders(combined);
        }
        return combined;
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

    return this.fetchCloudData().pipe(
      tap(data => {
        let list: SharedOrder[] = Array.isArray(data.orders) ? data.orders : [];
        const idx = list.findIndex(o => o.id === order.id || (o.orderNumber && o.orderNumber === order.orderNumber));
        if (idx === -1) {
          list.unshift(order);
        } else {
          list[idx] = order;
        }
        data.orders = list;
        this.putCloudData(data);
      }),
      map(() => void 0)
    );
  }

  updateOrderStatus(orderId: string, status: any): Observable<void> {
    const local = this.getLocalOrders();
    const found = local.find(o => o.id === orderId || o.orderNumber === orderId);
    if (found) {
      found.status = status;
      this.saveLocalOrders(local);
    }

    return this.fetchCloudData().pipe(
      tap(data => {
        let list: SharedOrder[] = Array.isArray(data.orders) ? data.orders : [];
        const target = list.find(o => o.id === orderId || o.orderNumber === orderId);
        if (target) {
          target.status = status;
        }
        data.orders = list;
        this.putCloudData(data);
      }),
      map(() => void 0)
    );
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
    return this.http.get<any>(this.CLOUD_STORE_URL).pipe(
      map(res => {
        const cloudContracts: SharedContractRequest[] = (res && res.data && Array.isArray(res.data.contracts)) ? res.data.contracts : [];
        const localContracts = this.getLocalContracts();

        const cloudIds = new Set(cloudContracts.map(c => c.id));
        const localOnly = localContracts.filter(l => !cloudIds.has(l.id));
        const combined = [...localOnly, ...cloudContracts];

        combined.sort((a, b) => new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime());

        if (combined.length > 0) {
          this.saveLocalContracts(combined);
        }
        return combined;
      }),
      catchError(() => of(this.getLocalContracts()))
    );
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

    return this.fetchCloudData().pipe(
      tap(data => {
        let list: SharedContractRequest[] = Array.isArray(data.contracts) ? data.contracts : [];
        const idx = list.findIndex(c => c.id === contract.id);
        if (idx === -1) {
          list.unshift(contract);
        } else {
          list[idx] = contract;
        }
        data.contracts = list;
        this.putCloudData(data);
      }),
      map(() => void 0)
    );
  }

  updateContractStatus(contractId: string, status: string): Observable<void> {
    const local = this.getLocalContracts();
    const found = local.find(c => c.id === contractId);
    if (found) {
      found.status = status;
      this.saveLocalContracts(local);
    }

    return this.fetchCloudData().pipe(
      tap(data => {
        let list: SharedContractRequest[] = Array.isArray(data.contracts) ? data.contracts : [];
        const target = list.find(c => c.id === contractId);
        if (target) {
          target.status = status;
        }
        data.contracts = list;
        this.putCloudData(data);
      }),
      map(() => void 0)
    );
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
    return this.http.get<any>(this.CLOUD_STORE_URL).pipe(
      map(res => {
        const cloudMessages: SharedContactMessage[] = (res && res.data && Array.isArray(res.data.messages)) ? res.data.messages : [];
        const localMessages = this.getLocalMessages();

        const cloudIds = new Set(cloudMessages.map(m => m.id));
        const localOnly = localMessages.filter(l => !cloudIds.has(l.id));
        const combined = [...localOnly, ...cloudMessages];

        combined.sort((a, b) => new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime());

        if (combined.length > 0) {
          this.saveLocalMessages(combined);
        }
        return combined;
      }),
      catchError(() => of(this.getLocalMessages()))
    );
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

    return this.fetchCloudData().pipe(
      tap(data => {
        let list: SharedContactMessage[] = Array.isArray(data.messages) ? data.messages : [];
        const idx = list.findIndex(m => m.id === message.id);
        if (idx === -1) {
          list.unshift(message);
        } else {
          list[idx] = message;
        }
        data.messages = list;
        this.putCloudData(data);
      }),
      map(() => void 0)
    );
  }

  updateMessageStatus(messageId: string, status: string): Observable<void> {
    const local = this.getLocalMessages();
    const found = local.find(m => m.id === messageId);
    if (found) {
      found.status = status;
      this.saveLocalMessages(local);
    }

    return this.fetchCloudData().pipe(
      tap(data => {
        let list: SharedContactMessage[] = Array.isArray(data.messages) ? data.messages : [];
        const target = list.find(m => m.id === messageId);
        if (target) {
          target.status = status;
        }
        data.messages = list;
        this.putCloudData(data);
      }),
      map(() => void 0)
    );
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
        amount: order.totalAmount,
        gateway: isCash ? 'Cash on Delivery' : 'Stripe',
        status: isCash ? 'pending' : 'completed',
        customerName: order.customerName,
        createdAt: order.createdAt
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
            amount: order.totalAmount,
            gateway: isCash ? 'Cash on Delivery' : 'Stripe',
            status: isCash ? 'pending' : 'completed',
            customerName: order.customerName || 'عميل دار الوصل',
            createdAt: order.createdAt
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

  private fetchCloudData(): Observable<CloudStorePayload> {
    return this.http.get<any>(this.CLOUD_STORE_URL).pipe(
      map(res => {
        const d = (res && res.data) ? res.data : {};
        return {
          orders: Array.isArray(d.orders) ? d.orders : this.getLocalOrders(),
          contracts: Array.isArray(d.contracts) ? d.contracts : this.getLocalContracts(),
          messages: Array.isArray(d.messages) ? d.messages : this.getLocalMessages(),
          payments: Array.isArray(d.payments) ? d.payments : []
        };
      }),
      catchError(() => of({
        orders: this.getLocalOrders(),
        contracts: this.getLocalContracts(),
        messages: this.getLocalMessages(),
        payments: []
      }))
    );
  }

  private putCloudData(payload: CloudStorePayload): void {
    this.http.put(this.CLOUD_STORE_URL, {
      name: 'elwasl_shared_orders_store',
      data: payload
    }).subscribe({ error: () => {} });
  }

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
