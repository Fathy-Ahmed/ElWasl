import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, signal } from '@angular/core';
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
                             subtitle="مراجعة العمليات المالية الإلكترونية والدفع عند الاستلام وبوابات الدفع (Stripe/Paymob)."
                             [breadcrumbs]="breadcrumbs">
      </app-admin-page-header>

      <app-admin-data-table [columns]="tableColumns" 
                             [data]="payments()">
      </app-admin-data-table>
    </div>
  `,
  styles: []
})
export class PaymentListPageComponent implements OnInit {
  private readonly PAYMENTS_KEY = 'elwasl_admin_mock_payments';

  readonly breadcrumbs = [
    { label: 'الرئيسية / Admin', route: '/admin' },
    { label: 'المدفوعات / Payments' }
  ];

  readonly tableColumns: TableColumn[] = [
    { key: 'transactionId', label: 'رقم العملية / Transaction ID' },
    { key: 'orderId', label: 'رقم الطلب / Order ID' },
    { key: 'customerName', label: 'العميل / Customer' },
    { key: 'amount', label: 'المبلغ / Amount', type: 'currency' },
    { key: 'gateway', label: 'البوابة / Gateway' },
    { key: 'status', label: 'الحالة / Status', type: 'badge' }
  ];

  readonly payments = signal<any[]>([]);

  ngOnInit(): void {
    this.loadPayments();

    if (typeof window !== 'undefined') {
      try {
        const channel = new BroadcastChannel('elwasl_orders_channel');
        channel.onmessage = () => this.loadPayments();
      } catch {}
    }
  }

  @HostListener('window:storage')
  onStorageChange(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    try {
      const raw = localStorage.getItem(this.PAYMENTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.payments.set(parsed);
          return;
        }
      }
    } catch {}

    // Seed defaults if empty
    const initial = [
      { transactionId: 'txn-cod-100203', orderId: 'ORD-20260621-5164', customerName: 'Hana Taha', amount: 80, gateway: 'Cash on Delivery', status: 'pending' },
      { transactionId: 'txn-card-100201', orderId: 'ORD-20260620-1102', customerName: 'Ahmed Fathy', amount: 350, gateway: 'Stripe', status: 'completed' },
      { transactionId: 'txn-card-100202', orderId: 'ord-f8e2d4', customerName: 'Sara Ali', amount: 199, gateway: 'Paymob', status: 'pending' }
    ];
    localStorage.setItem(this.PAYMENTS_KEY, JSON.stringify(initial));
    this.payments.set(initial);
  }
}
