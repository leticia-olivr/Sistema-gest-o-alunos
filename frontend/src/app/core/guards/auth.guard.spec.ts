import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthSessionService } from '../services/auth-session.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let session: AuthSessionService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    session = TestBed.inject(AuthSessionService);
    router = TestBed.inject(Router);
    stubLocalStorage();
  });

  afterEach(() => vi.unstubAllGlobals());

  it('redirects to login and preserves the requested route without a session', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard(
        {} as ActivatedRouteSnapshot,
        { url: '/inicio' } as RouterStateSnapshot,
      ),
    );

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toContain('/login');
    expect(router.serializeUrl(result as UrlTree)).toContain('returnUrl=%2Finicio');
  });

  it('allows a session with a future expiration', () => {
    session.saveToken(createToken(Math.floor(Date.now() / 1000) + 3600));

    const result = TestBed.runInInjectionContext(() =>
      authGuard(
        {} as ActivatedRouteSnapshot,
        { url: '/inicio' } as RouterStateSnapshot,
      ),
    );

    expect(result).toBe(true);
  });

  it('clears an expired token and redirects with an expired-session message', () => {
    session.saveToken(createToken(Math.floor(Date.now() / 1000) - 1));

    const result = TestBed.runInInjectionContext(() =>
      authGuard(
        {} as ActivatedRouteSnapshot,
        { url: '/inicio' } as RouterStateSnapshot,
      ),
    );

    expect(session.getToken()).toBeNull();
    expect(router.serializeUrl(result as UrlTree)).toContain('sessionExpired=true');
  });

  it('removes the local token and navigates to login on logout', () => {
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    session.saveToken(createToken(Math.floor(Date.now() / 1000) + 3600));

    session.logout();

    expect(session.getToken()).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith('/login');
  });
});

function createToken(expiration: number): string {
  const payload = btoa(JSON.stringify({ sub: 'usuario123', exp: expiration }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

  return `header.${payload}.signature`;
}

function stubLocalStorage(): void {
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
    clear: () => storage.clear(),
  });
}