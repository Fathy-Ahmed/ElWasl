import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
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
export class ContractRequestListPageComponent {
  constructor(private snackBar: MatSnackBar) {}

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

  readonly contractRequests = signal([
    { id: 'cr-101', authorName: 'أحمد صالح', bookTitle: 'صرخة الأندلس', date: '2026-06-20', status: 'under_review' },
    { id: 'cr-102', authorName: 'منى غانم', bookTitle: 'رحلة البحث عن الذات', date: '2026-06-19', status: 'delivered' }
  ]);

  handleAction(event: { action: string; row: any }): void {
    const requestId = event.row.id;
    if (event.action === 'review') {
      this.contractRequests.update(current => 
        current.map(cr => cr.id === requestId ? { ...cr, status: 'under_review' } : cr)
      );
      this.snackBar.open(`تم تغيير حالة الطلب ${requestId} إلى قيد المراجعة / Under Review`, 'إغلاق / Close', { duration: 3000 });
    } else if (event.action === 'approve') {
      this.contractRequests.update(current => 
        current.map(cr => cr.id === requestId ? { ...cr, status: 'delivered' } : cr)
      );
      this.snackBar.open(`تم قبول المسودة والطلب ${requestId} بنجاح / Request approved`, 'إغلاق / Close', { duration: 3000 });
    } else if (event.action === 'reject') {
      this.contractRequests.update(current => 
        current.map(cr => cr.id === requestId ? { ...cr, status: 'canceled' } : cr)
      );
      this.snackBar.open(`تم رفض طلب التعاقد ${requestId} / Request rejected`, 'إغلاق / Close', { duration: 3000 });
    }
  }
}
