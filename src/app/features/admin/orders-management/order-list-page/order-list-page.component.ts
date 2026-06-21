import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
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
  }

  loadOrders(): void {
    this.adminApiService.getOrders(1, 50).subscribe({
      next: (res) => {
        const mapped = (res.items || []).map(o => ({
          id: o.id,
          idDisplay: o.orderNumber || o.id.substring(0, 8),
          customerName: o.userEmail || 'Client',
          date: new Date(o.createdAt).toLocaleDateString(),
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

  private mapStatusEnumToString(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending:
        return 'pending';
      case OrderStatus.Paid:
        return 'delivered'; // treated as completed/paid
      case OrderStatus.Shipped:
        return 'shipped';
      case OrderStatus.Cancelled:
        return 'canceled';
      case OrderStatus.Refunded:
        return 'canceled';
      default:
        return 'pending';
    }
  }
}
