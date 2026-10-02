import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private searchSubscription?: Subscription;

  readonly busca = new FormControl('', { nonNullable: true });
  readonly alunos = signal<Aluno[]>([]);
  readonly carregando = signal(true);
  readonly erro = signal('');
  readonly sucesso = signal('');
  readonly status = signal<AlunoStatusFilter>('ATIVOS');
  readonly pagina = signal(0);
  readonly tamanhoPagina = 10;
  readonly total = signal(0);
  readonly totalPaginas = signal(0);
  readonly isAdmin = this.authSession.getRole() === 'ADMIN';

  ngOnInit(): void {
    this.aplicarEstadoDaUrl();
    this.consumirMensagemCadastro();
    this.searchSubscription = this.busca.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.pagina.set(0);
        this.sincronizarUrl();
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
    this.sincronizarUrl();
    this.carregar();
  }

  irParaPagina(pagina: number): void {
    if (pagina < 0 || pagina >= this.totalPaginas() || pagina === this.pagina()) {
      return;
    }
    this.pagina.set(pagina);
    this.sincronizarUrl();
    this.carregar();
  }

  tentarNovamente(): void {
    this.carregar();
  }

  limparBusca(): void {
    const tinhaBusca = Boolean(this.busca.value);
    this.busca.setValue('');
    this.pagina.set(0);
    this.sincronizarUrl();
    if (!tinhaBusca || this.pagina() === 0) {
      this.carregar();
    }
  }

  alternarStatusAluno(aluno: Aluno): void {
    if (!this.isAdmin) {
      return;
    }

    const texto = aluno.ativo
      ? `Inativar o aluno ${aluno.nome} (${aluno.matricula})? Ele deixará de aparecer entre os ativos.`
      : `Reativar o aluno ${aluno.nome} (${aluno.matricula})? Ele voltará a aparecer entre os ativos.`;

    if (!window.confirm(texto)) {
      return;
    }

    const totalAntes = this.total();
    const paginaAntes = this.pagina();
    const requisicao = aluno.ativo ? this.api.inativar(aluno.id) : this.api.reativar(aluno.id);

    this.carregando.set(true);
    this.erro.set('');
    requisicao.subscribe({
      next: () => {
        const deveVoltarPagina = this.status() === 'ATIVOS' && paginaAntes > 0 && totalAntes <= paginaAntes * this.tamanhoPagina + 1;
        if (deveVoltarPagina) {
          this.pagina.set(Math.max(0, paginaAntes - 1));
          this.sincronizarUrl();
        }
        this.carregar();
      },
      error: (error: unknown) => {
        this.carregando.set(false);
        this.erro.set(this.mensagemErro(error));
      },
    });
  }

  paramsRetorno(): Record<string, string | number | null> {
    return {
      busca: this.busca.value.trim() || null,
      status: this.status(),
      page: this.pagina(),
    };
  }

  primeiroResultado(): number {
    return this.total() === 0 ? 0 : this.pagina() * this.tamanhoPagina + 1;
  }

  ultimoResultado(): number {
    return Math.min((this.pagina() + 1) * this.tamanhoPagina, this.total());
  }

  paginas(): number[] {
    return Array.from({ length: this.totalPaginas() }, (_, pagina) => pagina);
  }

  private aplicarEstadoDaUrl(): void {
    const busca = this.route.snapshot.queryParamMap.get('busca') ?? '';
    const statusParam = this.route.snapshot.queryParamMap.get('status');
    const pageParam = Number(this.route.snapshot.queryParamMap.get('page') ?? '0');

    this.busca.setValue(busca);
    this.status.set(this.ehStatusValido(statusParam) ? statusParam : 'ATIVOS');
    this.pagina.set(Number.isFinite(pageParam) && pageParam >= 0 ? pageParam : 0);
  }

  private sincronizarUrl(): void {
    const busca = this.busca.value.trim();
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        busca: busca || null,
        status: this.status(),
        page: this.pagina(),
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private ehStatusValido(status: string | null): status is AlunoStatusFilter {
    return status === 'ATIVOS' || status === 'INATIVOS' || status === 'TODOS';
  }

  private consumirMensagemCadastro(): void {
    const matricula = this.route.snapshot.queryParamMap.get('matriculaCriada');
    if (!matricula) {
      return;
    }

    this.sucesso.set(`Cadastro realizado. Matrícula: ${matricula}.`);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { matriculaCriada: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
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