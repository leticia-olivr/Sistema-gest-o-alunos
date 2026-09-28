import {
  provideHttpClient,
  withInterceptors,
  HttpClient,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthSessionService } from '../services/auth-session.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTestingController: HttpTestingController;
  let router: Router;
  let session: AuthSessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    session = TestBed.inject(AuthSessionService);
    stubLocalStorage();
  });

  afterEach(() => {
    httpTestingController.verify();
    vi.unstubAllGlobals();
  });

  it('adds the Bearer token to protected API calls', () => {
    session.saveToken(createToken(Math.floor(Date.now() / 1000) + 3600));

    http.get('/api/alunos').subscribe();

    const request = httpTestingController.expectOne('/api/alunos');
    expect(request.request.headers.get('Authorization')).toBe(
      `Bearer ${session.getToken()}`,
    );
    request.flush({});
  });

  it('does not add a token to the login request', () => {
    session.saveToken(createToken(Math.floor(Date.now() / 1000) + 3600));

    http.post('/api/auth/login', {}).subscribe();

    const request = httpTestingController.expectOne('/api/auth/login');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({ token: 'new-token' });
  });

  it('clears the session and redirects to login after a protected API returns 401', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    session.saveToken(createToken(Math.floor(Date.now() / 1000) + 3600));
    http.get('/api/alunos').subscribe({ error: () => undefined });

    httpTestingController
      .expectOne('/api/alunos')
      .flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(session.getToken()).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/login'], {
      queryParams: { sessionExpired: 'true', returnUrl: router.url },
    });
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