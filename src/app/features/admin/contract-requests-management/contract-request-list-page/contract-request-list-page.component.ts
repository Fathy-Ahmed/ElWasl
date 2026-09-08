import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AdminPageHeaderComponent } from '../../shared/components/admin-page-header/admin-page-header.component';
import { AdminDataTableComponent, TableColumn } from '../../shared/components/admin-data-table/admin-data-table.component';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  private readonly CONTRACTS_KEY = 'elwasl_contract_requests';

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
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

    try {
      const raw = localStorage.getItem(this.CONTRACTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const ids = new Set(parsed.map(p => p.id));
          const combined = [
            ...parsed,
            ...defaultRequests.filter(d => !ids.has(d.id))
          ];
          this.contractRequests.set(combined);
          return;
        }
      }
    } catch {}

    this.contractRequests.set(defaultRequests);
  }

  private saveRequests(requests: any[]): void {
    try {
      localStorage.setItem(this.CONTRACTS_KEY, JSON.stringify(requests));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
      }
    } catch {}
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
      this.contractRequests.update(current => {
        const updated = current.map(cr => cr.id === requestId ? { ...cr, status: newStatus } : cr);
        this.saveRequests(updated);
        return updated;
      });
      this.snackBar.open(message, 'إغلاق / Close', { duration: 3000 });
    }
  }
}
