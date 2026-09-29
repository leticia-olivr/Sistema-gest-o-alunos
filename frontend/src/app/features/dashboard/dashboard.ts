import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { AuthSessionService } from '../../core/services/auth-session.service';

@Component({
  selector: 'app-dashboard',
  imports: [MatButtonModule, RouterLink],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly authSession = inject(AuthSessionService);

  readonly isAdmin = this.authSession.getRole() === 'ADMIN';
}