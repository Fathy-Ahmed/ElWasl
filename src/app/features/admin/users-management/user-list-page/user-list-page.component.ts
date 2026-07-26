import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AdminPageHeaderComponent } from '../../shared/components/admin-page-header/admin-page-header.component';
import { AdminDataTableComponent, TableColumn } from '../../shared/components/admin-data-table/admin-data-table.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserDialogComponent, UserManagementDto } from '../user-dialog/user-dialog.component';
import { ConfirmDialogComponent } from '../user-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-list-page',
  standalone: true,
  imports: [
    CommonModule, 
    TranslateModule, 
    AdminPageHeaderComponent, 
    AdminDataTableComponent,
    MatDialogModule
  ],
  template: `
    <div class="management-page">
      <app-admin-page-header title="إدارة الأعضاء والعملاء / Users Management" 
                             subtitle="إضافة، تعديل وحذف المستخدمين، وإسناد الصلاحيات وتغيير حالات تفعيلهم."
                             [breadcrumbs]="breadcrumbs"
                             actionLabel="إضافة عضو جديد / Add User"
                             actionIcon="add"
                             (actionClick)="addNewUser()">
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
export class UserListPageComponent implements OnInit {
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  private readonly USERS_KEY = 'elwasl_admin_mock_users';

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
    { name: 'edit', icon: 'edit', color: 'primary', idPrefix: 'edit-user-' },
    { name: 'delete', icon: 'delete', color: 'warn', idPrefix: 'del-user-' },
    { name: 'toggleStatus', icon: 'sync_alt', color: 'accent', idPrefix: 'toggle-user-' }
  ];

  readonly users = signal<UserManagementDto[]>([]);

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    const raw = localStorage.getItem(this.USERS_KEY);
    if (raw) {
      try {
        this.users.set(JSON.parse(raw));
        return;
      } catch {}
    }

    const defaultUsers: UserManagementDto[] = [
      { id: 'usr-1', name: 'John Doe', email: 'john@example.com', role: 'User', status: 'active' },
      { id: 'usr-2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'active' },
      { id: 'usr-3', name: 'Admin Administrator', email: 'admin@elwasl.com', role: 'Admin', status: 'active' },
      { id: 'usr-4', name: 'James Brown', email: 'james@example.com', role: 'User', status: 'inactive' }
    ];
    this.saveUsers(defaultUsers);
  }

  private saveUsers(usersList: UserManagementDto[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(usersList));
    this.users.set(usersList);
  }

  addNewUser(): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe((result: UserManagementDto) => {
      if (result) {
        const newUser: UserManagementDto = {
          id: `usr-${Date.now()}`,
          name: result.name,
          email: result.email,
          role: result.role,
          status: result.status
        };

        const currentUsers = [...this.users()];
        currentUsers.push(newUser);
        this.saveUsers(currentUsers);
        this.snackBar.open('تم إضافة العضو بنجاح / User added successfully', 'إغلاق / Close', { duration: 3000 });
      }
    });
  }

  handleAction(event: { action: string; row: any }): void {
    const userId = event.row.id;

    if (event.action === 'toggleStatus') {
      const updated = this.users().map(u => 
        u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
      );
      this.saveUsers(updated);
      this.snackBar.open(`تم تغيير حالة العضو بنجاح / User status updated`, 'إغلاق / Close', { duration: 3000 });
      
    } else if (event.action === 'edit') {
      const dialogRef = this.dialog.open(UserDialogComponent, {
        width: '600px',
        data: { user: event.row }
      });

      dialogRef.afterClosed().subscribe((result: UserManagementDto) => {
        if (result) {
          const updated = this.users().map(u => 
            u.id === userId ? { ...u, name: result.name, email: result.email, role: result.role, status: result.status } : u
          );
          this.saveUsers(updated);
          this.snackBar.open('تم تحديث بيانات العضو بنجاح / User updated successfully', 'إغلاق / Close', { duration: 3000 });
        }
      });

    } else if (event.action === 'delete') {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: 'حذف العضو / Delete User',
          message: `هل أنت متأكد من رغبتك في حذف العضو "${event.row.name}" نهائياً من النظام؟`
        }
      });

      dialogRef.afterClosed().subscribe((confirmed: boolean) => {
        if (confirmed) {
          const updated = this.users().filter(u => u.id !== userId);
          this.saveUsers(updated);
          this.snackBar.open('تم حذف العضو بنجاح / User deleted successfully', 'إغلاق / Close', { duration: 3000 });
        }
      });
    }
  }
}
