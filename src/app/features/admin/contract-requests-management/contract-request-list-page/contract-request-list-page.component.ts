import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, signal, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AdminPageHeaderComponent } from '../../shared/components/admin-page-header/admin-page-header.component';
import { AdminDataTableComponent, TableColumn } from '../../shared/components/admin-data-table/admin-data-table.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedOrderSyncService } from '../../../../core/services/shared-order-sync.service';

@Component({
  selector: 'app-contract-request-list-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, AdminPageHeaderComponent, AdminDataTableComponent],
  template: `
    <div class="management-page">
      <app-admin-page-header title="إدارة طلبات التعاقد والنشر / Author Contracts" 
                             subtitle="مراجعة مسودات الكتب والروايات المرفوعة من قبل المؤلفين الجدد والبت فيها."
                             [breadcrumbs]="breadcrumbs">
      </app-admin-page-header>

      <app-admin-data-table [columns]="tableColumns" 
                             [data]="contractRequests()" 
                             [actions]="tableActions"
                             (actionClick)="handleAction($event)">
      </app-admin-data-table>
    </div>
  `,
  styles: []
})
export class ContractRequestListPageComponent implements OnInit {
  private readonly sharedOrderSyncService = inject(SharedOrderSyncService);
  private readonly snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loadRequests();

    if (typeof window !== 'undefined') {
      try {
        const channel = new BroadcastChannel('elwasl_orders_channel');
        channel.onmessage = () => this.loadRequests();
      } catch {}
    }
  }

  @HostListener('window:focus')
  onWindowFocus(): void {
    this.loadRequests();
  }

  @HostListener('window:storage')
  onStorageChange(): void {
    this.loadRequests();
  }

  readonly breadcrumbs = [
    { label: 'الرئيسية / Admin', route: '/admin' },
    { label: 'طلبات التعاقد / Contracts' }
  ];

  readonly tableColumns: TableColumn[] = [
    { key: 'id', label: 'المعرف / ID' },
    { key: 'authorName', label: 'الكاتب / Author' },
    { key: 'bookTitle', label: 'عنوان العمل / Title' },
    { key: 'date', label: 'تاريخ التقديم / Date', type: 'date' },
    { key: 'status', label: 'الحالة / Status', type: 'badge' }
  ];

  readonly tableActions = [
    { name: 'review', icon: 'rate_review', color: 'primary', idPrefix: 'review-contract-' },
    { name: 'approve', icon: 'check_circle', color: 'accent', idPrefix: 'approve-contract-' },
    { name: 'reject', icon: 'cancel', color: 'warn', idPrefix: 'reject-contract-' }
  ];

  readonly contractRequests = signal<any[]>([]);

  private loadRequests(): void {
    const defaultRequests = [
      { id: 'cr-101', authorName: 'أحمد صالح', bookTitle: 'صرخة الأندلس', date: '2026-06-20', status: 'under_review' },
      { id: 'cr-102', authorName: 'منى غانم', bookTitle: 'رحلة البحث عن الذات', date: '2026-06-19', status: 'delivered' }
    ];

    this.sharedOrderSyncService.getContracts().subscribe({
      next: (contracts) => {
        const ids = new Set(contracts.map(p => p.id));
        const combined = [
          ...contracts,
          ...defaultRequests.filter(d => !ids.has(d.id))
        ];
        this.contractRequests.set(combined);
      },
      error: () => {
        this.contractRequests.set(defaultRequests);
      }
    });
  }

  handleAction(event: { action: string; row: any }): void {
    const requestId = event.row.id;
    let newStatus = '';
    let message = '';

    if (event.action === 'review') {
      newStatus = 'under_review';
      message = `تم تغيير حالة الطلب ${requestId} إلى قيد المراجعة / Under Review`;
    } else if (event.action === 'approve') {
      newStatus = 'delivered';
      message = `تم قبول المسودة والطلب ${requestId} بنجاح / Request approved`;
    } else if (event.action === 'reject') {
      newStatus = 'canceled';
      message = `تم رفض طلب التعاقد ${requestId} / Request rejected`;
    }

    if (newStatus) {
      this.sharedOrderSyncService.updateContractStatus(requestId, newStatus).subscribe();
      this.contractRequests.update(current => {
        return current.map(cr => cr.id === requestId ? { ...cr, status: newStatus } : cr);
      });
      this.snackBar.open(message, 'إغلاق / Close', { duration: 3000 });
    }
  }
}
