export interface Aluno {
  id: number;
  matricula: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  ativo: boolean;
  dataCriacao: string;
  fotoUrl: string | null;
}