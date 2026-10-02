import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Aluno } from '../models/aluno.model';
import { AlunoApiService } from '../services/aluno-api.service';
import {
  alunoCpfValidator,
  alunoEmailValidators,
  alunoFotoValidator,
  alunoNomeValidators,
  alunoTelefoneValidator,
} from '../validators/aluno-validators';

@Component({
  selector: 'app-aluno-form',
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './aluno-form.html',
  styleUrl: './aluno-form.css',
})
export class AlunoForm implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly api = inject(AlunoApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly carregando = signal(false);
  readonly enviando = signal(false);
  readonly erro = signal('');
  readonly sucesso = signal('');
  readonly aluno = signal<Aluno | null>(null);
  readonly removerFoto = signal(false);
  readonly form = this.formBuilder.group({
    nome: this.formBuilder.nonNullable.control('', alunoNomeValidators),
    email: this.formBuilder.nonNullable.control('', alunoEmailValidators),
    cpf: this.formBuilder.nonNullable.control('', [Validators.required, alunoCpfValidator]),
    telefone: this.formBuilder.nonNullable.control('', [Validators.required, alunoTelefoneValidator]),
    foto: this.formBuilder.control<File | null>(null, alunoFotoValidator),
    ativo: this.formBuilder.nonNullable.control(true),
  });
  private valoresOriginais = this.form.getRawValue();

  get editando(): boolean {
    return this.aluno() !== null;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (Number.isInteger(id) && id > 0) {
      this.carregarAluno(id);
    }
  }

  selecionarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.form.controls.foto.setValue(input.files?.[0] ?? null);
    this.form.controls.foto.markAsTouched();
    this.form.controls.foto.markAsDirty();
    this.removerFoto.set(false);
  }

  marcarRemocaoFoto(): void {
    this.form.controls.foto.setValue(null);
    this.form.controls.foto.markAsDirty();
    this.removerFoto.set(true);
  }

  confirmarSaida(): boolean {
    return !this.haAlteracoesNaoSalvas() || window.confirm('Existem alterações não salvas. Deseja sair mesmo assim?');
  }

  haAlteracoesNaoSalvas(): boolean {
    const valoresAtuais = this.form.getRawValue();
    return this.removerFoto()
      || valoresAtuais.nome !== this.valoresOriginais.nome
      || valoresAtuais.email !== this.valoresOriginais.email
      || valoresAtuais.cpf !== this.valoresOriginais.cpf
      || valoresAtuais.telefone !== this.valoresOriginais.telefone
      || valoresAtuais.foto !== this.valoresOriginais.foto
      || valoresAtuais.ativo !== this.valoresOriginais.ativo;
  }

  @HostListener('window:beforeunload', ['$event'])
  protegerSaidaDoNavegador(event: BeforeUnloadEvent): void {
    if (this.haAlteracoesNaoSalvas()) {
      event.preventDefault();
      event.returnValue = '';
    }
  }

  erroDoCampo(campo: 'nome' | 'email' | 'cpf' | 'telefone' | 'foto'): string {
    const controle = this.form.controls[campo];
    if (!controle.touched || !controle.errors) {
      return '';
    }
    if (controle.hasError('required')) {
      return 'Campo obrigatório.';
    }
    if (controle.hasError('minlength')) {
      return 'Informe pelo menos 3 caracteres.';
    }
    if (controle.hasError('maxlength')) {
      return campo === 'nome' ? 'Use no máximo 120 caracteres.' : 'Use no máximo 150 caracteres.';
    }
    if (controle.hasError('pattern')) {
      return 'Use apenas letras, espaços, hífen e apóstrofo.';
    }
    if (controle.hasError('email')) {
      return 'Informe um e-mail válido.';
    }
    if (controle.hasError('cpf')) {
      return 'Confira o CPF e os dígitos verificadores.';
    }
    if (controle.hasError('telefone')) {
      return 'Informe um telefone válido com DDD.';
    }
    if (controle.hasError('fotoTamanho')) {
      return 'A foto deve ter no máximo 5 MB.';
    }
    if (controle.hasError('fotoFormato')) {
      return 'Envie uma imagem JPEG ou PNG.';
    }
    return 'Valor inválido.';
  }

  salvar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.enviando() || !this.haAlteracoesNaoSalvas()) {
      return;
    }

    this.enviando.set(true);
    this.erro.set('');
    this.sucesso.set('');
    const dados = this.criarFormData();
    const valoresEnviados = this.form.getRawValue();
    const aluno = this.aluno();
    const requisicao = aluno
      ? this.api.atualizar(aluno.id, dados)
      : this.api.criar(dados);

    requisicao.subscribe({
      next: (salvo) => {
        this.aluno.set(salvo);
        this.enviando.set(false);
        this.sucesso.set(
          aluno
            ? 'Alterações salvas.'
            : `Cadastro realizado. Matrícula: ${salvo.matricula}.`,
        );
        this.valoresOriginais = valoresEnviados;
        this.form.markAsPristine();
        this.removerFoto.set(false);
        this.form.controls.cpf.disable();
        if (!aluno) {
          this.voltar(salvo.matricula);
        }
      },
      error: (error: unknown) => {
        this.enviando.set(false);
        this.erro.set(this.mensagemErro(error));
      },
    });
  }

  voltar(matriculaCriada?: string): void {
    const params = this.route.snapshot.queryParamMap;
    const queryParams = {
      busca: params.get('busca') || null,
      status: params.get('status') || null,
      page: params.get('page') ? Number(params.get('page')) : null,
      matriculaCriada: matriculaCriada ?? null,
    };

    void this.router.navigate(['/alunos'], {
      queryParams,
      replaceUrl: true,
    });
  }

  private carregarAluno(id: number): void {
    this.carregando.set(true);
    this.api.buscarPorId(id).subscribe({
      next: (aluno) => {
        this.aluno.set(aluno);
        this.form.patchValue({
          nome: aluno.nome,
          email: aluno.email,
          cpf: aluno.cpf,
          telefone: aluno.telefone,
          ativo: aluno.ativo,
        });
        this.valoresOriginais = this.form.getRawValue();
        this.form.controls.cpf.disable();
        this.carregando.set(false);
      },
      error: (error: unknown) => {
        this.carregando.set(false);
        this.erro.set(this.mensagemErro(error));
      },
    });
  }

  private criarFormData(): FormData {
    const dados = this.form.getRawValue();
    const formData = new FormData();
    formData.append('nome', dados.nome.trim());
    formData.append('email', dados.email.trim());
    formData.append('telefone', dados.telefone);
    if (!this.editando) {
      formData.append('cpf', dados.cpf);
    } else {
      formData.append('ativo', String(dados.ativo));
      formData.append('removerFoto', String(this.removerFoto()));
    }
    if (dados.foto) {
      formData.append('foto', dados.foto);
    }
    return formData;
  }

  private mensagemErro(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 409) {
        return 'Já existe um aluno com esse CPF ou e-mail.';
      }
      if (error.status === 400 || error.status === 422) {
        return 'Revise os campos destacados e tente novamente.';
      }
      if (error.status === 0) {
        return 'Não foi possível conectar ao servidor. Tente novamente.';
      }
      if (error.status === 404) {
        return 'Aluno não encontrado.';
      }
    }
    return 'Não foi possível salvar os dados do aluno.';
  }
}