import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        if (error.status === 401) {
          // Suppress 401 alert to avoid breaking active mock/local sessions
          return throwError(() => error);
        } else {
          errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
      }

      // Suppress alert for local mock-supported endpoints to prevent confusing error popups
      const urlLower = req.url.toLowerCase();
      const isMockSupported = urlLower.includes('/admin/books') ||
                              urlLower.includes('/admin/audiobooks') ||
                              urlLower.includes('/admin/games') ||
                              urlLower.includes('/admin/orders') ||
                              urlLower.includes('/admin/payments') ||
                              urlLower.includes('/admin/exhibitions') ||
                              urlLower.includes('/categories') ||
                              urlLower.includes('/orders') ||
                              urlLower.includes('/payments') ||
                              urlLower.includes('/books') ||
                              urlLower.includes('/audiobooks') ||
                              urlLower.includes('/games') ||
                              urlLower.includes('/exhibitions');

      if (!isMockSupported) {
        // Display to user via Material Snackbar
        snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }

      return throwError(() => new Error(errorMessage));
    })
  );
};
