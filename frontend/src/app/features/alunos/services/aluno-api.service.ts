import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Aluno, AlunoPage, AlunoStatusFilter } from '../models/aluno.model';

@Injectable({ providedIn: 'root' })
export class AlunoApiService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = '/api/alunos';

  buscarPorId(id: number): Observable<Aluno> {
    return this.http.get<Aluno>(`${this.endpoint}/${id}`);
  }

  buscarFoto(id: number): Observable<Blob> {
    return this.http.get(`${this.endpoint}/${id}/foto`, { responseType: 'blob' });
  }

  listar(params: {
    busca: string;
    status: AlunoStatusFilter;
    page: number;
    size: number;
  }): Observable<AlunoPage> {
    return this.http.get<AlunoPage>(this.endpoint, { params });
  }

  criar(dados: FormData): Observable<Aluno> {
    return this.http.post<Aluno>(this.endpoint, dados);
  }

  atualizar(id: number, dados: FormData): Observable<Aluno> {
    return this.http.put<Aluno>(`${this.endpoint}/${id}`, dados);
  }

  inativar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.endpoint}/${id}/inativar`, null);
  }

  reativar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.endpoint}/${id}/reativar`, null);
  }
}