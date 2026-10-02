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

    const role = this.decodePayload(token)?.['role'];
    return typeof role === 'string' ? role : null;
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
    const expiry = this.decodePayload(token)?.['exp'];
    return typeof expiry === 'number' && expiry > Math.floor(Date.now() / 1000);
  }

  private decodePayload(token: string): Record<string, unknown> | null {
    try {
      const payloadSegment = token.split('.')[1];
      if (!payloadSegment) {
        return null;
      }
      const base64 = payloadSegment
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(payloadSegment.length / 4) * 4, '=');
      const payload: unknown = JSON.parse(atob(base64));
      return typeof payload === 'object' && payload !== null
        ? payload as Record<string, unknown>
        : null;
    } catch {
      return null;
    }
  }
}