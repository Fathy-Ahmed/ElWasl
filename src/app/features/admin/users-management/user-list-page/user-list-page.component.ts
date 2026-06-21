import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AdminPageHeaderComponent } from '../../shared/components/admin-page-header/admin-page-header.component';
import { AdminDataTableComponent, TableColumn } from '../../shared/components/admin-data-table/admin-data-table.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-list-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, AdminPageHeaderComponent, AdminDataTableComponent],
  template: `
    <div class="management-page">
      <app-admin-page-header title="إدارة الأعضاء والعملاء / Users Management" 
                             subtitle="قائمة بجميع المستخدمين المسجلين في النظام، وإمكانية تفعيل أو إلغاء حساباتهم."
                             [breadcrumbs]="breadcrumbs">
      </app-admin-page-header>

      <app-admin-data-table [columns]="tableColumns" 
                             [data]="users()" 
                             [actions]="tableActions"
                             (actionClick)="handleAction($event)">
      </app-admin-data-table>
    </div>
  `,
  styles: []
})
export class UserListPageComponent {
  constructor(private snackBar: MatSnackBar) {}

  readonly breadcrumbs = [
    { label: 'الرئيسية / Admin', route: '/admin' },
    { label: 'الأعضاء / Users' }
  ];

  readonly tableColumns: TableColumn[] = [
    { key: 'id', label: 'المعرف / ID' },
    { key: 'name', label: 'الاسم / Name' },
    { key: 'email', label: 'البريد الإلكتروني / Email' },
    { key: 'role', label: 'الصلاحية / Role' },
    { key: 'status', label: 'الحالة / Status', type: 'badge' }
  ];

  readonly tableActions = [
    { name: 'toggleStatus', icon: 'sync_alt', color: 'primary', idPrefix: 'toggle-user-' }
  ];

  readonly users = signal([
    { id: 'usr-1', name: 'John Doe', email: 'john@example.com', role: 'User', status: 'active' },
    { id: 'usr-2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'active' },
    { id: 'usr-3', name: 'Admin Administrator', email: 'admin@elwasl.com', role: 'Admin', status: 'active' },
    { id: 'usr-4', name: 'James Brown', email: 'james@example.com', role: 'User', status: 'inactive' }
  ]);

  handleAction(event: { action: string; row: any }): void {
    const userId = event.row.id;
    if (event.action === 'toggleStatus') {
      this.users.update(current => 
        current.map(u => u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u)
      );
      this.snackBar.open(`تم تغيير حالة العضو بنجاح / User status updated`, 'إغلاق / Close', { duration: 3000 });
    }
  }
}
