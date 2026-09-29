import { FormControl } from '@angular/forms';
import {
  alunoCpfValidator,
  alunoEmailValidators,
  alunoFotoValidator,
  alunoNomeValidators,
  alunoTelefoneValidator,
} from './aluno-validators';

describe('validadores de aluno', () => {
  it('valida nome e e-mail de acordo com o contrato da API', () => {
    const nome = new FormControl('Maria da Silva', alunoNomeValidators);
    const email = new FormControl('maria@example.com', alunoEmailValidators);

    expect(nome.valid).toBe(true);
    expect(new FormControl('Jo', alunoNomeValidators).hasError('minlength')).toBe(true);
    expect(new FormControl('Maria123', alunoNomeValidators).hasError('pattern')).toBe(true);
    expect(email.valid).toBe(true);
    expect(new FormControl('email-invalido', alunoEmailValidators).hasError('email')).toBe(true);
  });

  it('valida CPF com ou sem máscara e rejeita dígitos inválidos', () => {
    expect(new FormControl('529.982.247-25', alunoCpfValidator).valid).toBe(true);
    expect(new FormControl('52998224725', alunoCpfValidator).valid).toBe(true);
    expect(new FormControl('111.111.111-11', alunoCpfValidator).hasError('cpf')).toBe(true);
  });

  it('valida telefone fixo ou celular brasileiro', () => {
    expect(new FormControl('(11) 98765-4321', alunoTelefoneValidator).valid).toBe(true);
    expect(new FormControl('1132345678', alunoTelefoneValidator).valid).toBe(true);
    expect(new FormControl('(00) 98765-4321', alunoTelefoneValidator).hasError('telefone')).toBe(true);
  });

  it('aceita foto opcional JPEG/PNG até 5 MB', () => {
    const fotoValida = new File(['conteudo'], 'foto.png', { type: 'image/png' });
    const fotoInvalida = new File(['conteudo'], 'foto.gif', { type: 'image/gif' });
    const fotoGrande = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'foto.png', {
      type: 'image/png',
    });

    expect(new FormControl<File | null>(null, alunoFotoValidator).valid).toBe(true);
    expect(new FormControl(fotoValida, alunoFotoValidator).valid).toBe(true);
    expect(new FormControl(fotoInvalida, alunoFotoValidator).hasError('fotoFormato')).toBe(true);
    expect(new FormControl(fotoGrande, alunoFotoValidator).hasError('fotoTamanho')).toBe(true);
  });
});