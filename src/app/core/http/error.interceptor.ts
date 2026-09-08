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

      // Suppress alert for background sync, external endpoints, and mock-supported endpoints
      const urlLower = req.url.toLowerCase();
      const isSuppressed = urlLower.includes('api.restful-api.dev') ||
                           urlLower.includes('restful-api') ||
                           urlLower.includes('sync') ||
                           urlLower.includes('/admin/books') ||
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
                           urlLower.includes('/exhibitions') ||
                           urlLower.includes('/auth/me') ||
                           urlLower.includes('/auth/refresh') ||
                           req.method === 'GET' ||
                           error.status === 403 ||
                           error.status === 405;

      if (!isSuppressed) {
        // Display user-facing errors (e.g. form submissions, payments) via Material Snackbar
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
