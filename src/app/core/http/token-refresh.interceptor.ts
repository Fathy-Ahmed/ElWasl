import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const tokenRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const injector = inject(Injector);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Intercept 401 Unauthorized errors
      // Exclude requests to Auth endpoints to avoid infinite redirection loops
      if (
        error.status === 401 &&
        !req.url.includes('/Auth/refresh') &&
        !req.url.includes('/Auth/login') &&
        !req.url.includes('/Auth/register')
      ) {
        const authService = injector.get(AuthService);
        return authService.refreshToken().pipe(
          switchMap((res: any) => {
            if (res.accessToken) {
              // Clone the request with the new access token
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${res.accessToken}`
                }
              });
              return next(newReq);
            }
            // If no token was returned, log out and redirect
            authService.logout();
            router.navigate(['/auth/login'], { queryParams: { returnUrl: router.url } });
            return throwError(() => error);
          }),
          catchError((refreshErr) => {
            // If refresh fails, log out and redirect
            authService.logout();
            router.navigate(['/auth/login'], { queryParams: { returnUrl: router.url } });
            return throwError(() => refreshErr);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
