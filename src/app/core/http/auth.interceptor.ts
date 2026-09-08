import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const urlLower = req.url.toLowerCase();
  if (
    urlLower.includes('/auth/login') ||
    urlLower.includes('/auth/register') ||
    urlLower.includes('/auth/refresh')
  ) {
    return next(req);
  }

  // We can inject a token from AuthService or check localStorage
  const token = localStorage.getItem('access_token');

  // Clone and attach token if present
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
