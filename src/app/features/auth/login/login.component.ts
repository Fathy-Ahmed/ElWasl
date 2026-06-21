import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  loginForm!: FormGroup;
  readonly isSubmitting = signal<boolean>(false);
  readonly hidePassword = signal<boolean>(true);
  private returnUrl: string = '/';

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.snackBar.open('يرجى إدخال البريد الإلكتروني وكلمة المرور بشكل صحيح / Please enter valid email and password', 'إغلاق / Close', {
        duration: 4000
      });
      return;
    }

    this.isSubmitting.set(true);

    this.authService.login({
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.snackBar.open('تم تسجيل الدخول بنجاح / Logged in successfully', 'إغلاق / Close', { duration: 2000 });
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const errMsg = err.error?.detail || err.message || 'خطأ في البريد الإلكتروني أو كلمة المرور / Invalid email or password';
        this.snackBar.open(errMsg, 'إغلاق / Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
