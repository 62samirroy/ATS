import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn) return true;
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

export const roleGuard = (...roles: string[]): CanActivateFn => {
  return (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (auth.isLoggedIn && auth.hasRole(...roles)) return true;
    router.navigate(['/dashboard']);
    return false;
  };
};

export const publicGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn) return true;
  router.navigate(['/dashboard']);
  return false;
};
