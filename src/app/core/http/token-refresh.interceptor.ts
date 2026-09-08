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
      const urlLower = req.url.toLowerCase();
      if (
        error.status === 401 &&
        !urlLower.includes('/auth/refresh') &&
        !urlLower.includes('/auth/login') &&
        !urlLower.includes('/auth/register')
      ) {
        const authService = injector.get(AuthService);
        return authService.refreshToken().pipe(
          switchMap((res: any) => {
            if (res && res.accessToken) {
              // Clone the request with the new access token
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${res.accessToken}`
                }
              });
              return next(newReq);
            }
            return throwError(() => error);
          }),
          catchError(() => {
            return throwError(() => error);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
