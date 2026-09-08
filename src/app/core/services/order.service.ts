import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { 
  CreateOrderCommand, 
  OrderDto, 
  OrderDtoPaginatedList, 
  InitiatePaymentCommand, 
  LibraryItemDtoPaginatedList,
  OrderStatus
} from '../models/api.models';
import { AdminNotificationService } from './admin-notification.service';
import { SharedOrderSyncService } from './shared-order-sync.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly adminNotificationService = inject(AdminNotificationService);
  private readonly sharedOrderSyncService = inject(SharedOrderSyncService);
  private readonly ordersUrl = `${API_CONFIG.baseUrl}/api/v1/Orders`;
  private readonly paymentsUrl = `${API_CONFIG.baseUrl}/api/v1/Payments`;
  private readonly entitlementsUrl = `${API_CONFIG.baseUrl}/api/v1/Entitlements`;

  private readonly ADMIN_ORDERS_KEY = 'elwasl_admin_mock_orders';
  private readonly ADMIN_PAYMENTS_KEY = 'elwasl_admin_mock_payments';
  private readonly RECENT_ORDERS_KEY = 'elwasl_recent_orders';

  createOrder(command: CreateOrderCommand): Observable<OrderDto> {
    const timestamp = Date.now();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ord-${timestamp.toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const orderNumber = `ORD-${dateStr}-${randNum}`;

    const isCod = !command.customerDetails?.paymentMethod || 
                  command.customerDetails.paymentMethod.toLowerCase().includes('cash') ||
                  command.customerDetails.paymentMethod.toLowerCase().includes('cod');

    const paymentMethodDisplay = isCod ? 'Cash on Delivery / الدفع عند الاستلام' : 'Credit Card / بطاقة ائتمان';

    const localOrder: OrderDto = {
      id: orderId,
      orderNumber,
      status: 'Pending',
      totalAmount: command.totalAmount || 0,
      shippingAddressId: command.shippingAddressId || null,
      createdAt: new Date().toISOString(),
      orderItems: command.orderItemsSnapshot || [],
      customerName: command.customerDetails?.fullName || 'عميل دار الوصل',
      userEmail: command.customerDetails?.email || '',
      phoneNumber: command.customerDetails?.phone || '',
      shippingAddress: command.customerDetails ? `${command.customerDetails.address}, ${command.customerDetails.city}` : '',
      city: command.customerDetails?.city || '',
      paymentMethod: paymentMethodDisplay
    };

    // 1. Save to Admin Orders storage
    this.saveToAdminOrders(localOrder);

    // 2. Save to Admin Payments storage
    this.saveToAdminPayments(localOrder, isCod ? 'Cash on Delivery' : 'Credit Card');

    // 3. Save to User / Recent orders storage
    this.saveToUserOrders(localOrder);

    // 4. Save to shared cloud store for multi-device cross-browser sync
    this.sharedOrderSyncService.saveOrder(localOrder).subscribe({ error: () => {} });

    // Refresh notifications immediately
    this.adminNotificationService.refresh();

    // Notify any listening components across tabs
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      try {
        const channel = new BroadcastChannel('elwasl_orders_channel');
        channel.postMessage({ type: 'NEW_ORDER', order: localOrder });
        channel.close();
      } catch {}
    }

    // 4. Send to backend with graceful catch-and-fallback
    const apiPayload = {
      items: command.items || [],
      shippingAddressId: command.shippingAddressId || null
    };

    return this.http.post<OrderDto>(this.ordersUrl, apiPayload).pipe(
      map(res => {
        if (res && res.id) {
          const merged: OrderDto = { ...localOrder, ...res };
          this.updateLocalOrder(localOrder.id, merged);
          return merged;
        }
        return localOrder;
      }),
      catchError(() => {
        // Fallback gracefully without breaking checkout flow or alerting user
        return of(localOrder);
      })
    );
  }

  getOrders(pageNumber = 1, pageSize = 20): Observable<OrderDtoPaginatedList> {
    return this.http.get<OrderDtoPaginatedList>(this.ordersUrl, {
      params: {
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString()
      }
    }).pipe(
      map(res => {
        const local = this.getUserOrders();
        const serverItems = res?.items || [];
        const localOnly = local.filter(l => !serverItems.some(s => s.id === l.id || (s.orderNumber && s.orderNumber === l.orderNumber)));
        const combined = [...localOnly, ...serverItems];

        const start = (pageNumber - 1) * pageSize;
        const paged = combined.slice(start, start + pageSize);

        return {
          items: paged,
          pageNumber,
          pageSize,
          totalCount: combined.length,
          totalPages: Math.ceil(combined.length / pageSize) || 1,
          hasPreviousPage: pageNumber > 1,
          hasNextPage: start + pageSize < combined.length
        };
      }),
      catchError(() => {
        const local = this.getUserOrders();
        const start = (pageNumber - 1) * pageSize;
        const paged = local.slice(start, start + pageSize);

        return of({
          items: paged,
          pageNumber,
          pageSize,
          totalCount: local.length,
          totalPages: Math.ceil(local.length / pageSize) || 1,
          hasPreviousPage: pageNumber > 1,
          hasNextPage: start + pageSize < local.length
        });
      })
    );
  }

  getOrderById(id: string): Observable<OrderDto> {
    // Check local stores first
    const found = this.findLocalOrder(id);
    if (found) {
      return of(found);
    }

    return this.http.get<OrderDto>(`${this.ordersUrl}/${id}`).pipe(
      catchError(() => {
        const fallback = this.findLocalOrder(id);
        if (fallback) return of(fallback);
        throw new Error('Order not found');
      })
    );
  }

  initiatePayment(command: InitiatePaymentCommand): Observable<any> {
    return this.http.post<any>(`${this.paymentsUrl}/initiate`, command).pipe(
      catchError(() => {
        return of({ success: false, paymentUrl: null });
      })
    );
  }

  getEntitlements(pageNumber = 1, pageSize = 100): Observable<LibraryItemDtoPaginatedList> {
    return this.http.get<LibraryItemDtoPaginatedList>(this.entitlementsUrl, {
      params: {
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString()
      }
    }).pipe(
      catchError(() => {
        return of({
          items: [],
          pageNumber: 1,
          pageSize: 100,
          totalPages: 0,
          totalCount: 0,
          hasPreviousPage: false,
          hasNextPage: false
        });
      })
    );
  }

  // --- Persistence Helpers ---

  private saveToAdminOrders(order: OrderDto): void {
    try {
      const raw = localStorage.getItem(this.ADMIN_ORDERS_KEY);
      let orders = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(orders)) orders = [];

      const adminOrder = {
        id: order.id,
        orderNumber: order.orderNumber,
        userEmail: order.userEmail || '',
        customerName: order.customerName || 'عميل دار الوصل',
        totalAmount: order.totalAmount,
        status: OrderStatus.Pending,
        createdAt: order.createdAt,
        shippingAddress: order.shippingAddress,
        phoneNumber: order.phoneNumber,
        paymentMethod: order.paymentMethod,
        orderItems: order.orderItems
      };

      // Put newest order at top
      orders.unshift(adminOrder);
      localStorage.setItem(this.ADMIN_ORDERS_KEY, JSON.stringify(orders));
    } catch {}
  }

  private saveToAdminPayments(order: OrderDto, gateway: string): void {
    try {
      const raw = localStorage.getItem(this.ADMIN_PAYMENTS_KEY);
      let payments = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(payments)) payments = [];

      const randSuffix = Math.floor(100000 + Math.random() * 900000);
      const isCash = gateway.toLowerCase().includes('cash');

      const paymentRecord = {
        transactionId: `txn-${isCash ? 'cod' : 'card'}-${randSuffix}`,
        orderId: order.orderNumber || order.id,
        amount: order.totalAmount,
        gateway: isCash ? 'Cash on Delivery' : 'Stripe',
        status: 'pending',
        customerName: order.customerName,
        createdAt: order.createdAt
      };

      payments.unshift(paymentRecord);
      localStorage.setItem(this.ADMIN_PAYMENTS_KEY, JSON.stringify(payments));
    } catch {}
  }

  private saveToUserOrders(order: OrderDto): void {
    try {
      const storedUser = localStorage.getItem('user');
      let userId = '';
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          userId = u.id || '';
        } catch {}
      }

      const key = userId ? `elwasl_user_orders_${userId}` : this.RECENT_ORDERS_KEY;
      const raw = localStorage.getItem(key);
      let list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) list = [];

      list.unshift(order);
      localStorage.setItem(key, JSON.stringify(list));

      // Always save to recent orders as well for instant confirmation lookup
      if (key !== this.RECENT_ORDERS_KEY) {
        const rawRecent = localStorage.getItem(this.RECENT_ORDERS_KEY);
        let recentList = rawRecent ? JSON.parse(rawRecent) : [];
        if (!Array.isArray(recentList)) recentList = [];
        recentList.unshift(order);
        localStorage.setItem(this.RECENT_ORDERS_KEY, JSON.stringify(recentList));
      }
    } catch {}
  }

  private getUserOrders(): OrderDto[] {
    try {
      const storedUser = localStorage.getItem('user');
      let userId = '';
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          userId = u.id || '';
        } catch {}
      }

      if (userId) {
        const userOrdersRaw = localStorage.getItem(`elwasl_user_orders_${userId}`);
        if (userOrdersRaw) {
          const list = JSON.parse(userOrdersRaw);
          if (Array.isArray(list) && list.length > 0) return list;
        }
      }

      const recentRaw = localStorage.getItem(this.RECENT_ORDERS_KEY);
      if (recentRaw) {
        const list = JSON.parse(recentRaw);
        if (Array.isArray(list)) return list;
      }
    } catch {}
    return [];
  }

  private findLocalOrder(id: string): OrderDto | null {
    try {
      const all = [
        ...this.getUserOrders(),
        ...(JSON.parse(localStorage.getItem(this.ADMIN_ORDERS_KEY) || '[]'))
      ];
      return all.find((o: any) => o && (o.id === id || o.orderNumber === id)) || null;
    } catch {
      return null;
    }
  }

  private updateLocalOrder(oldId: string, updated: OrderDto): void {
    try {
      const keys = [this.ADMIN_ORDERS_KEY, this.RECENT_ORDERS_KEY];
      keys.forEach(k => {
        const raw = localStorage.getItem(k);
        if (raw) {
          let list = JSON.parse(raw);
          if (Array.isArray(list)) {
            const idx = list.findIndex((o: any) => o.id === oldId);
            if (idx > -1) {
              list[idx] = { ...list[idx], ...updated };
              localStorage.setItem(k, JSON.stringify(list));
            }
          }
        }
      });
    } catch {}
  }
}
