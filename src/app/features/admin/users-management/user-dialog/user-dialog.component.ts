import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

export interface UserManagementDto {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  status: string;
}

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.user ? 'تعديل بيانات العضو / Edit User Details' : 'إضافة عضو جديد / Add New User' }}
    </h2>
    
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content class="mat-typography dialog-content">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>الاسم بالكامل / Full Name</mat-label>
            <input matInput formControlName="name" required placeholder="John Doe">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>البريد الإلكتروني / Email Address</mat-label>
            <input matInput type="email" formControlName="email" required placeholder="name@example.com">
          </mat-form-field>
        </div>

        <div class="form-row">
          <!-- Password field: only required when creating new user -->
          @if (!data.user) {
            <mat-form-field appearance="outline">
              <mat-label>كلمة المرور / Password</mat-label>
              <input matInput type="password" formControlName="password" required>
            </mat-form-field>
          }

          <mat-form-field appearance="outline" [class.full-width]="data.user">
            <mat-label>الصلاحية / Role</mat-label>
            <mat-select formControlName="role" required>
              <mat-option value="User">عضو / User</mat-option>
              <mat-option value="Admin">مدير النظام / Admin</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>الحالة / Status</mat-label>
            <mat-select formControlName="status" required>
              <mat-option value="active">نشط / Active</mat-option>
              <mat-option value="inactive">غير نشط / Inactive</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-dialog-content>
 
      <mat-dialog-actions align="end">
        <button type="button" mat-button mat-dialog-close>إلغاء / Cancel</button>
        <button type="submit" mat-raised-button color="primary" [disabled]="form.invalid">حفظ / Save</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-width: 500px;
      padding-top: 10px;
    }
    .form-row {
      display: flex;
      gap: 16px;
    }
    .form-row mat-form-field {
      flex: 1;
    }
    .full-width {
      width: 100%;
    }
  `]
})
export class UserDialogComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user?: UserManagementDto }
  ) {}

  ngOnInit(): void {
    const user = this.data.user;
    this.form = this.fb.group({
      name: [user?.name || '', Validators.required],
      email: [user?.email || '', [Validators.required, Validators.email]],
      role: [user?.role || 'User', Validators.required],
      status: [user?.status || 'active', Validators.required]
    });

    if (!user) {
      this.form.addControl('password', this.fb.control('', [Validators.required, Validators.minLength(6)]));
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
