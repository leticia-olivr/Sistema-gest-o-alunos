import { CanDeactivateFn } from '@angular/router';

interface ConfirmarSaida {
  confirmarSaida(): boolean;
}

export const alunoFormCanDeactivateGuard: CanDeactivateFn<ConfirmarSaida> = (component) =>
  component.confirmarSaida();