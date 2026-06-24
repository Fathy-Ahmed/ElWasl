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
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  registerForm!: FormGroup;
  readonly isSubmitting = signal<boolean>(false);
  readonly hidePassword = signal<boolean>(true);
  private returnUrl: string = '/';

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit(): void {
    console.log('Register onSubmit triggered! Form value:', this.registerForm.value);
    if (this.registerForm.invalid) {
      console.warn('Form is invalid! Validation errors:', this.registerForm.errors);
      // Log individual control errors
      Object.keys(this.registerForm.controls).forEach(key => {
        const controlErrors = this.registerForm.get(key)?.errors;
        if (controlErrors != null) {
          console.warn(`Key: ${key}, Errors:`, controlErrors);
        }
      });
      this.registerForm.markAllAsTouched();
      this.snackBar.open('يرجى ملء جميع الحقول المطلوبة بشكل صحيح / Please fill in all required fields correctly', 'إغلاق / Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
      return;
    }

    this.isSubmitting.set(true);
    console.log('Form is valid. Sending API register request...');

    this.authService.register({
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      fullName: this.registerForm.value.name
    }).subscribe({
      next: (res) => {
        console.log('Register API Success:', res);
        this.snackBar.open('تم إنشاء الحساب بنجاح! جاري تسجيل الدخول... / Account created successfully! Logging in...', 'إغلاق / Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });

        // Automatically login after registration
        this.authService.login({
          email: this.registerForm.value.email,
          password: this.registerForm.value.password
        }).subscribe({
          next: (loginRes) => {
            console.log('Login API Success:', loginRes);
            this.isSubmitting.set(false);
            this.router.navigateByUrl(this.returnUrl);
          },
          error: (loginErr) => {
            console.error('Login API Error:', loginErr);
            this.isSubmitting.set(false);
            this.snackBar.open('فشل تسجيل الدخول التلقائي. يرجى تسجيل الدخول يدوياً / Automatic login failed. Please sign in manually.', 'إغلاق / Close', { duration: 5000 });
            this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.returnUrl } });
          }
        });
      },
      error: (err) => {
        console.error('Register API Error:', err);
        this.isSubmitting.set(false);
        const errMsg = err.error?.detail || err.message || 'فشلت عملية إنشاء الحساب / Registration failed';
        this.snackBar.open(errMsg, 'إغلاق / Close', {
          duration: 6000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
