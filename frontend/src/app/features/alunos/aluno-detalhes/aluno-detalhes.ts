import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { Aluno } from '../models/aluno.model';
import { AlunoApiService } from '../services/aluno-api.service';

@Component({
  selector: 'app-aluno-detalhes',
  imports: [DatePipe, MatButtonModule],
  templateUrl: './aluno-detalhes.html',
  styleUrl: './aluno-detalhes.css',
})
export class AlunoDetalhes implements OnInit {
  private readonly api = inject(AlunoApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly carregando = signal(false);
  readonly erro = signal('');
  readonly aluno = signal<Aluno | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (Number.isInteger(id) && id > 0) {
      this.carregarAluno(id);
      return;
    }

    this.erro.set('Aluno não encontrado.');
  }

  voltar(): void {
    const params = this.route.snapshot.queryParamMap;
    const queryParams = {
      busca: params.get('busca') || null,
      status: params.get('status') || null,
      page: params.get('page') ? Number(params.get('page')) : null,
    };

    void this.router.navigate(['/alunos'], {
      queryParams,
      replaceUrl: true,
    });
  }

  private carregarAluno(id: number): void {
    this.carregando.set(true);
    this.erro.set('');
    this.api.buscarPorId(id).subscribe({
      next: (aluno) => {
        this.aluno.set(aluno);
        this.carregando.set(false);
      },
      error: (error: unknown) => {
        this.carregando.set(false);
        this.erro.set(this.mensagemErro(error));
      },
    });
  }

  private mensagemErro(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 404) {
        return 'Aluno não encontrado.';
      }
      if (error.status === 0) {
        return 'Não foi possível conectar ao servidor. Tente novamente.';
      }
    }
    return 'Não foi possível carregar os dados do aluno.';
  }
}
