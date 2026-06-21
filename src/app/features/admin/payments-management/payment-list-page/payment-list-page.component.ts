import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AdminPageHeaderComponent } from '../../shared/components/admin-page-header/admin-page-header.component';
import { AdminDataTableComponent, TableColumn } from '../../shared/components/admin-data-table/admin-data-table.component';

@Component({
  selector: 'app-payment-list-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, AdminPageHeaderComponent, AdminDataTableComponent],
  template: `
    <div class="management-page">
      <app-admin-page-header title="إدارة المدفوعات / Payments Management" 
                             subtitle="مراجعة العمليات المالية الإلكترونية وبوابات الدفع (Stripe/Paymob)."
                             [breadcrumbs]="breadcrumbs">
      </app-admin-page-header>

      <app-admin-data-table [columns]="tableColumns" 
                             [data]="payments()">
      </app-admin-data-table>
    </div>
  `,
  styles: []
})
export class PaymentListPageComponent {
  readonly breadcrumbs = [
    { label: 'الرئيسية / Admin', route: '/admin' },
    { label: 'المدفوعات / Payments' }
  ];

  readonly tableColumns: TableColumn[] = [
    { key: 'transactionId', label: 'رقم العملية / Transaction ID' },
    { key: 'orderId', label: 'رقم الطلب / Order ID' },
    { key: 'amount', label: 'المبلغ / Amount', type: 'currency' },
    { key: 'gateway', label: 'البوابة / Gateway' },
    { key: 'status', label: 'الحالة / Status', type: 'badge' }
  ];

  readonly payments = signal([
    { transactionId: 'txn-100201', orderId: 'ord-a4b2c1', amount: 330, gateway: 'Stripe', status: 'completed' },
    { transactionId: 'txn-100202', orderId: 'ord-f8e2d4', amount: 199, gateway: 'Paymob', status: 'pending' },
    { transactionId: 'txn-100203', orderId: 'ord-k2l9m3', amount: 450, gateway: 'Cash', status: 'completed' }
  ]);
}
