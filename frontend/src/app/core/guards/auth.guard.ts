import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSessionService } from '../services/auth-session.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const session = inject(AuthSessionService);
  const router = inject(Router);
  const hasStoredToken = session.getToken() !== null;

  if (session.hasValidSession()) {
    return true;
  }

  session.clearToken();

  return router.createUrlTree(['/login'], {
    queryParams: {
      returnUrl: state.url,
      ...(hasStoredToken ? { sessionExpired: 'true' } : {}),
    },
  });
};