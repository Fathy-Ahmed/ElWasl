import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject, HostListener } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AdminPageHeaderComponent } from '../../shared/components/admin-page-header/admin-page-header.component';
import { AdminDataTableComponent, TableColumn } from '../../shared/components/admin-data-table/admin-data-table.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminApiService } from '../../../../core/services/admin-api.service';
import { OrderStatus } from '../../../../core/models/api.models';

@Component({
  selector: 'app-order-list-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, AdminPageHeaderComponent, AdminDataTableComponent],
  template: `
    <div class="management-page">
      <app-admin-page-header title="إدارة طلبات الشراء / Orders Management" 
                             subtitle="متابعة حالة الطلبيات، تعديل حالات الشحن والدفع، وإجراء المرتجعات."
                             [breadcrumbs]="breadcrumbs">
      </app-admin-page-header>

      <app-admin-data-table [columns]="tableColumns" 
                             [data]="orders()" 
                             [actions]="tableActions"
                             (actionClick)="handleAction($event)">
      </app-admin-data-table>
    </div>
  `,
  styles: []
})
export class OrderListPageComponent implements OnInit {
  private readonly adminApiService = inject(AdminApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly breadcrumbs = [
    { label: 'الرئيسية / Admin', route: '/admin' },
    { label: 'الطلبات / Orders' }
  ];

  readonly tableColumns: TableColumn[] = [
    { key: 'idDisplay', label: 'المعرف / ID' },
    { key: 'customerName', label: 'العميل / Customer' },
    { key: 'date', label: 'التاريخ / Date', type: 'date' },
    { key: 'total', label: 'الإجمالي / Total', type: 'currency' },
    { key: 'status', label: 'حالة الطلب / Status', type: 'badge' }
  ];

  readonly tableActions = [
    { name: 'ship', icon: 'local_shipping', color: 'primary', idPrefix: 'ship-order-' },
    { name: 'deliver', icon: 'check_circle', color: 'accent', idPrefix: 'deliv-order-' },
    { name: 'cancel', icon: 'cancel', color: 'warn', idPrefix: 'cancel-order-' }
  ];

  readonly orders = signal<any[]>([]);

  ngOnInit(): void {
    this.loadOrders();

    if (typeof window !== 'undefined') {
      try {
        const channel = new BroadcastChannel('elwasl_orders_channel');
        channel.onmessage = () => this.loadOrders();
      } catch {}
    }
  }

  @HostListener('window:focus')
  onWindowFocus(): void {
    this.loadOrders();
  }

  @HostListener('window:storage')
  onStorageChange(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.adminApiService.getOrders(1, 50).subscribe({
      next: (res) => {
        let items = res && Array.isArray(res.items) ? res.items : [];
        if (items.length === 0) {
          try {
            const raw = localStorage.getItem('elwasl_admin_mock_orders');
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed) && parsed.length > 0) items = parsed;
            }
          } catch {}
        }
        const mapped = items.map(o => ({
          id: o.id,
          idDisplay: o.orderNumber || (o.id ? o.id.substring(0, 8) : 'ORD'),
          customerName: (o as any).customerName || o.userEmail || 'عميل دار الوصل',
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
          total: o.totalAmount,
          status: this.mapStatusEnumToString(o.status),
          raw: o
        }));
        this.orders.set(mapped);
      }
    });
  }

  handleAction(event: { action: string; row: any }): void {
    const orderId = event.row.id;
    const orderNum = event.row.idDisplay;

    if (event.action === 'ship') {
      this.adminApiService.updateOrderStatus(orderId, OrderStatus.Shipped).subscribe({
        next: () => {
          this.loadOrders();
          this.snackBar.open(`تم تغيير حالة الطلب ${orderNum} إلى جاري الشحن / Order shipped`, 'إغلاق / Close', { duration: 3000 });
        }
      });
    } else if (event.action === 'deliver') {
      this.adminApiService.updateOrderStatus(orderId, OrderStatus.Paid).subscribe({
        next: () => {
          this.loadOrders();
          this.snackBar.open(`تم تغيير حالة الطلب ${orderNum} إلى تم التوصيل / Order delivered`, 'إغلاق / Close', { duration: 3000 });
        }
      });
    } else if (event.action === 'cancel') {
      this.adminApiService.updateOrderStatus(orderId, OrderStatus.Cancelled).subscribe({
        next: () => {
          this.loadOrders();
          this.snackBar.open(`تم إلغاء الطلب ${orderNum} بنجاح / Order canceled`, 'إغلاق / Close', { duration: 3000 });
        }
      });
    }
  }

  private mapStatusEnumToString(status: any): string {
    if (typeof status === 'string') {
      const lower = status.toLowerCase();
      if (lower.includes('pend')) return 'pending';
      if (lower.includes('ship')) return 'shipped';
      if (lower.includes('deliv') || lower.includes('paid') || lower.includes('comp')) return 'delivered';
      if (lower.includes('canc') || lower.includes('refun')) return 'canceled';
      return lower;
    }
    switch (status) {
      case OrderStatus.Pending:
      case 1:
        return 'pending';
      case OrderStatus.Paid:
      case 2:
        return 'delivered';
      case OrderStatus.Shipped:
      case 3:
        return 'shipped';
      case OrderStatus.Cancelled:
      case 4:
        return 'canceled';
      case OrderStatus.Refunded:
      case 5:
        return 'canceled';
      default:
        return 'pending';
    }
  }
}
