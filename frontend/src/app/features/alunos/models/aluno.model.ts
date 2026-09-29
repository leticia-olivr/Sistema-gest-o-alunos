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

export interface AlunoPage {
  content: Aluno[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type AlunoStatusFilter = 'ATIVOS' | 'INATIVOS' | 'TODOS';