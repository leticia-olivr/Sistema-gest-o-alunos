import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

const NOME_ALUNO_PATTERN = /^[\p{L}\p{M}]+(?:[ '\-][\p{L}\p{M}]+)*$/u;
const DDD_VALIDOS = new Set([
  '11', '12', '13', '14', '15', '16', '17', '18', '19',
  '21', '22', '24', '27', '28', '31', '32', '33', '34', '35', '37', '38',
  '41', '42', '43', '44', '45', '46', '47', '48', '49', '51', '53', '54', '55',
  '61', '62', '63', '64', '65', '66', '67', '68', '69', '71', '73', '74', '75',
  '77', '79', '81', '82', '83', '84', '85', '86', '87', '88', '89', '91', '92',
  '93', '94', '95', '96', '97', '98', '99',
]);

export const alunoNomeValidators: ValidatorFn[] = [
  Validators.required,
  Validators.minLength(3),
  Validators.maxLength(120),
  Validators.pattern(NOME_ALUNO_PATTERN),
];

export const alunoEmailValidators: ValidatorFn[] = [
  Validators.required,
  Validators.email,
  Validators.maxLength(150),
];

export const alunoCpfValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = stringValue(control.value);
  if (!value.trim()) {
    return null;
  }
  if (!/^[0-9.\-\s]+$/.test(value)) {
    return { cpf: true };
  }

  const cpf = value.replace(/\D/g, '');
  if (cpf.length !== 11 || new Set(cpf).size === 1) {
    return { cpf: true };
  }

  const firstDigit = calculateCpfDigit(cpf.slice(0, 9), 10);
  const secondDigit = calculateCpfDigit(`${cpf.slice(0, 9)}${firstDigit}`, 11);
  return Number(cpf[9]) === firstDigit && Number(cpf[10]) === secondDigit
    ? null
    : { cpf: true };
};

export const alunoTelefoneValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = stringValue(control.value);
  if (!value.trim()) {
    return null;
  }
  if (!/^[0-9()\-\s]+$/.test(value)) {
    return { telefone: true };
  }

  const telefone = value.replace(/\D/g, '');
  if ((telefone.length !== 10 && telefone.length !== 11) || !DDD_VALIDOS.has(telefone.slice(0, 2))) {
    return { telefone: true };
  }

  const celular = telefone.length === 11 && telefone[2] === '9';
  const fixo = telefone.length === 10 && Number(telefone[2]) >= 2 && Number(telefone[2]) <= 5;
  return celular || fixo ? null : { telefone: true };
};

export const alunoFotoValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const foto = control.value as File | null;
  if (!foto) {
    return null;
  }

  if (foto.size > 5 * 1024 * 1024) {
    return { fotoTamanho: true };
  }

  const tipo = foto.type.toLowerCase();
  return tipo === 'image/jpeg' || tipo === 'image/png'
    ? null
    : { fotoFormato: true };
};

function calculateCpfDigit(base: string, initialWeight: number): number {
  const sum = [...base].reduce(
    (total, digit, index) => total + Number(digit) * (initialWeight - index),
    0,
  );
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}