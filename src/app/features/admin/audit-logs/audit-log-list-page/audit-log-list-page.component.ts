import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AdminPageHeaderComponent } from '../../shared/components/admin-page-header/admin-page-header.component';
import { AdminDataTableComponent, TableColumn } from '../../shared/components/admin-data-table/admin-data-table.component';

@Component({
  selector: 'app-audit-log-list-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, AdminPageHeaderComponent, AdminDataTableComponent],
  template: `
    <div class="management-page">
      <app-admin-page-header title="سجل الأحداث والعمليات / System Audit Logs" 
                             subtitle="سجل لمراقبة جميع إجراءات المدراء وتعديل البيانات في النظام."
                             [breadcrumbs]="breadcrumbs">
      </app-admin-page-header>

      <app-admin-data-table [columns]="tableColumns" 
                             [data]="logs()">
      </app-admin-data-table>
    </div>
  `,
  styles: []
})
export class AuditLogListPageComponent {
  readonly breadcrumbs = [
    { label: 'الرئيسية / Admin', route: '/admin' },
    { label: 'سجلات الأحداث / Audit Logs' }
  ];

  readonly tableColumns: TableColumn[] = [
    { key: 'timestamp', label: 'الوقت / Time', type: 'date' },
    { key: 'adminUser', label: 'المسؤول / Admin' },
    { key: 'action', label: 'العملية / Action' },
    { key: 'details', label: 'التفاصيل / Details' }
  ];

  readonly logs = signal([
    { timestamp: '2026-06-21T18:30:00Z', adminUser: 'admin@elwasl.com', action: 'Update Book Stock', details: 'Changed stock for book b2 to 3' },
    { timestamp: '2026-06-21T17:45:00Z', adminUser: 'admin@elwasl.com', action: 'Deliver Order', details: 'Changed status of order ord-a4b2c1 to delivered' }
  ]);
}
