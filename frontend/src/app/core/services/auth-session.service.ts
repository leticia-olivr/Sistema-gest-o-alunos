import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly router = inject(Router);
  private readonly tokenStorageKey = 'siga_auth_token';

  getToken(): string | null {
    return localStorage.getItem(this.tokenStorageKey);
  }

  getValidToken(): string | null {
    const token = this.getToken();

    if (!token || !this.hasValidExpiry(token)) {
      return null;
    }

    return token;
  }

  hasValidSession(): boolean {
    return this.getValidToken() !== null;
  }

  getRole(): string | null {
    const token = this.getValidToken();
    if (!token) {
      return null;
    }

    try {
      const payloadSegment = token.split('.')[1];
      if (!payloadSegment) {
        return null;
      }
      const base64 = payloadSegment
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(payloadSegment.length / 4) * 4, '=');
      const payload = JSON.parse(atob(base64)) as { role?: unknown };
      return typeof payload.role === 'string' ? payload.role : null;
    } catch {
      return null;
    }
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenStorageKey, token);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenStorageKey);
  }

  logout(): void {
    this.clearToken();
    void this.router.navigateByUrl('/login');
  }

  private hasValidExpiry(token: string): boolean {
    try {
      const payloadSegment = token.split('.')[1];

      if (!payloadSegment) {
        return false;
      }

      const base64 = payloadSegment
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(payloadSegment.length / 4) * 4, '=');
      const payload = JSON.parse(atob(base64)) as { exp?: unknown };

      return (
        typeof payload.exp === 'number' &&
        payload.exp > Math.floor(Date.now() / 1000)
      );
    } catch {
      return false;
    }
  }
}