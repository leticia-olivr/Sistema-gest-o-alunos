import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthSessionService } from '../services/auth-session.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(AuthSessionService);
  const router = inject(Router);
  const isApiRequest = request.url.startsWith('/api/');
  const isLoginRequest = request.url === '/api/auth/login';
  const token = isApiRequest && !isLoginRequest
    ? session.getValidToken()
    : null;
  const authenticatedRequest = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authenticatedRequest).pipe(
    catchError((error: unknown) => {
      if (
        isApiRequest &&
        !isLoginRequest &&
        error instanceof HttpErrorResponse &&
        error.status === 401
      ) {
        session.clearToken();
        void router.navigate(['/login'], {
          queryParams: {
            sessionExpired: 'true',
            returnUrl: router.url,
          },
        });
      }

      return throwError(() => error);
    }),
  );
};