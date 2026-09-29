import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthSessionService } from '../services/auth-session.service';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  let session: AuthSessionService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    session = TestBed.inject(AuthSessionService);
    router = TestBed.inject(Router);
    stubLocalStorage();
  });

  afterEach(() => vi.unstubAllGlobals());

  it('allows ADMIN and redirects LEITOR to the dashboard', () => {
    session.saveToken(createToken('ADMIN'));
    const adminResult = TestBed.runInInjectionContext(() =>
      adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect(adminResult).toBe(true);

    session.saveToken(createToken('LEITOR'));
    const readerResult = TestBed.runInInjectionContext(() =>
      adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect(readerResult).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(readerResult as UrlTree)).toBe('/inicio');
  });
});

function createToken(role: string): string {
  const payload = btoa(JSON.stringify({
    sub: 'usuario123',
    role,
    exp: Math.floor(Date.now() / 1000) + 3600,
  }))
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