import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  readonly sessionMessage = signal(
    this.activatedRoute.snapshot.queryParamMap.get('sessionExpired') === 'true'
      ? 'Sua sessão terminou. Entre novamente para continuar.'
      : '',
  );
  readonly form = this.formBuilder.nonNullable.group({
    usuario: [
      '',
      [Validators.required, Validators.minLength(8), Validators.pattern(/^[a-zA-Z0-9]+$/)],
    ],
    senha: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*[0-9]).+$/),
      ],
    ],
  });

  submit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.sessionMessage.set('');

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        const returnUrl = this.activatedRoute.snapshot.queryParamMap.get('returnUrl');
        const destination = this.isSafeReturnUrl(returnUrl) ? returnUrl : '/inicio';
        void this.router.navigateByUrl(destination);
      },
      error: (error: unknown) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(this.getErrorMessage(error));
      },
    });
  }

  private isSafeReturnUrl(url: string | null): url is string {
    return Boolean(url?.startsWith('/') && !url.startsWith('//') && url !== '/login');
  }

  private getErrorMessage(error: unknown): string {
    if (
      error instanceof HttpErrorResponse &&
      (error.status === 401 || error.status === 403)
    ) {
      return 'Usuário ou senha incorretos. Confira seus dados e tente novamente.';
    }

    if (error instanceof HttpErrorResponse && error.status === 0) {
      return 'Não foi possível conectar ao servidor. Tente novamente em instantes.';
    }

    return 'Não foi possível entrar. Tente novamente em instantes.';
  }
}