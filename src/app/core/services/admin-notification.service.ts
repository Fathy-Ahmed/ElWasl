import { Injectable, computed, signal, inject } from '@angular/core';
import { OrderStatus } from '../models/api.models';
import { SharedOrderSyncService } from './shared-order-sync.service';
import { forkJoin, of, catchError } from 'rxjs';

export interface AdminNotification {
  id: string;
  title: string;
  subtitle: string;
  type: 'order' | 'contract' | 'message';
  route: string;
  date: string;
  status: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminNotificationService {
  private readonly sharedOrderSyncService = inject(SharedOrderSyncService);

  private readonly ORDERS_KEY = 'elwasl_admin_mock_orders';
  private readonly CONTRACTS_KEY = 'elwasl_contract_requests';
  private readonly MESSAGES_KEY = 'elwasl_contact_messages';

  readonly pendingOrdersCount = signal<number>(0);
  readonly pendingContractsCount = signal<number>(0);
  readonly pendingMessagesCount = signal<number>(0);

  readonly recentNotifications = signal<AdminNotification[]>([]);

  readonly totalNotificationsCount = computed(() => {
    return this.pendingOrdersCount() + this.pendingContractsCount() + this.pendingMessagesCount();
  });

  constructor() {
    this.refresh();
    this.syncWithCloud();

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', () => this.refresh());
      window.addEventListener('focus', () => this.syncWithCloud());
      setInterval(() => this.syncWithCloud(), 20000);
      try {
        const channel = new BroadcastChannel('elwasl_orders_channel');
        channel.onmessage = () => {
          this.refresh();
          this.syncWithCloud();
        };
      } catch {}
    }
  }

  syncWithCloud(): void {
    forkJoin({
      orders: this.sharedOrderSyncService.getOrders().pipe(catchError(() => of([]))),
      contracts: this.sharedOrderSyncService.getContracts().pipe(catchError(() => of([]))),
      messages: this.sharedOrderSyncService.getMessages().pipe(catchError(() => of([])))
    }).subscribe({
      next: () => this.refresh()
    });
  }

  refresh(): void {
    const orders = this.getStoredList(this.ORDERS_KEY);
    const contracts = this.getStoredList(this.CONTRACTS_KEY);
    const messages = this.getStoredList(this.MESSAGES_KEY);

    // Calculate pending orders (status is either numeric OrderStatus.Pending (1) or string 'pending')
    const pendingOrders = orders.filter(o => {
      const s = o.status;
      return s === OrderStatus.Pending || s === 1 || String(s).toLowerCase() === 'pending';
    });
    this.pendingOrdersCount.set(pendingOrders.length);

    // Calculate pending contracts (status is 'under_review' or 'pending')
    const pendingContracts = contracts.filter(c => {
      const s = String(c.status || '').toLowerCase();
      return s === 'pending' || s === 'under_review' || s === '';
    });
    this.pendingContractsCount.set(pendingContracts.length);

    // Calculate pending messages (status is 'pending')
    const pendingMessages = messages.filter(m => {
      const s = String(m.status || '').toLowerCase();
      return s === 'pending' || s === '';
    });
    this.pendingMessagesCount.set(pendingMessages.length);

    // Build notifications list
    const notifications: AdminNotification[] = [];

    pendingOrders.slice(0, 5).forEach(o => {
      notifications.push({
        id: `notif-ord-${o.id}`,
        title: `طلب شراء جديد: ${o.orderNumber || o.id.substring(0, 8)}`,
        subtitle: `${o.customerName || o.userEmail || 'عميل'} • ${o.totalAmount} ج.م`,
        type: 'order',
        route: '/admin/orders',
        date: o.createdAt || new Date().toISOString(),
        status: 'pending',
        icon: 'shopping_basket'
      });
    });

    pendingContracts.slice(0, 5).forEach(c => {
      notifications.push({
        id: `notif-cr-${c.id}`,
        title: `طلب تعاقد جديد: ${c.bookTitle || 'مسودة عمل جديد'}`,
        subtitle: `الكاتب: ${c.authorName || c.email || 'مؤلف'}`,
        type: 'contract',
        route: '/admin/contract-requests',
        date: c.date || c.createdAt || new Date().toISOString(),
        status: 'pending',
        icon: 'rate_review'
      });
    });

    pendingMessages.slice(0, 5).forEach(m => {
      notifications.push({
        id: `notif-msg-${m.id}`,
        title: `رسالة تواصل: ${m.subject || 'استفسار جديد'}`,
        subtitle: `من: ${m.senderName || m.email || 'زائر'}`,
        type: 'message',
        route: '/admin/contact-messages',
        date: m.date || m.createdAt || new Date().toISOString(),
        status: 'pending',
        icon: 'forum'
      });
    });

    // Sort notifications by date descending
    notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    this.recentNotifications.set(notifications);
  }

  private getStoredList(key: string): any[] {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  }
}
