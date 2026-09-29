import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { AuthSessionService } from '../../../core/services/auth-session.service';
import { AlunoApiService } from '../services/aluno-api.service';
import { Aluno, AlunoStatusFilter } from '../models/aluno.model';

@Component({
  selector: 'app-aluno-list',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './aluno-list.html',
  styleUrl: './aluno-list.css',
})
export class AlunoList implements OnInit, OnDestroy {
  private readonly api = inject(AlunoApiService);
  private readonly authSession = inject(AuthSessionService);
  private searchSubscription?: Subscription;

  readonly busca = new FormControl('', { nonNullable: true });
  readonly alunos = signal<Aluno[]>([]);
  readonly carregando = signal(true);
  readonly erro = signal('');
  readonly status = signal<AlunoStatusFilter>('ATIVOS');
  readonly pagina = signal(0);
  readonly tamanhoPagina = 10;
  readonly total = signal(0);
  readonly totalPaginas = signal(0);
  readonly isAdmin = this.authSession.getRole() === 'ADMIN';

  ngOnInit(): void {
    this.searchSubscription = this.busca.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.pagina.set(0);
        this.carregar();
      });
    this.carregar();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  alterarStatus(status: AlunoStatusFilter): void {
    this.status.set(status);
    this.pagina.set(0);
    this.carregar();
  }

  irParaPagina(pagina: number): void {
    if (pagina < 0 || pagina >= this.totalPaginas() || pagina === this.pagina()) {
      return;
    }
    this.pagina.set(pagina);
    this.carregar();
  }

  tentarNovamente(): void {
    this.carregar();
  }

  limparBusca(): void {
    const tinhaBusca = Boolean(this.busca.value);
    this.busca.setValue('');
    if (this.pagina() !== 0) {
      this.pagina.set(0);
      if (!tinhaBusca) {
        this.carregar();
      }
    }
  }

  primeiroResultado(): number {
    return this.total() === 0 ? 0 : this.pagina() * this.tamanhoPagina + 1;
  }

  ultimoResultado(): number {
    return Math.min((this.pagina() + 1) * this.tamanhoPagina, this.total());
  }

  private carregar(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.api.listar({
      busca: this.busca.value.trim(),
      status: this.status(),
      page: this.pagina(),
      size: this.tamanhoPagina,
    }).subscribe({
      next: (resultado) => {
        this.alunos.set(resultado.content);
        this.total.set(resultado.totalElements);
        this.totalPaginas.set(resultado.totalPages);
        this.pagina.set(resultado.page);
        this.carregando.set(false);
      },
      error: (error: unknown) => {
        this.carregando.set(false);
        this.erro.set(this.mensagemErro(error));
      },
    });
  }

  private mensagemErro(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 0) {
      return 'Não foi possível conectar ao servidor.';
    }
    if (error instanceof HttpErrorResponse && error.status === 401) {
      return 'Sua sessão expirou. Entre novamente para continuar.';
    }
    return 'Não foi possível carregar os alunos.';
  }
}