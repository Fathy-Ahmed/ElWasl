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
      const isMockSupported = req.url.includes('/admin/books') ||
                              req.url.includes('/admin/audiobooks') ||
                              req.url.includes('/admin/games') ||
                              req.url.includes('/admin/orders') ||
                              req.url.includes('/Categories') ||
                              req.url.includes('/orders') ||
                              req.url.includes('/Books') ||
                              req.url.includes('/Audiobooks') ||
                              req.url.includes('/Games');

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
