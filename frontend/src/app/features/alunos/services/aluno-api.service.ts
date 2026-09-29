import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Aluno } from '../models/aluno.model';

@Injectable({ providedIn: 'root' })
export class AlunoApiService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = '/api/alunos';

  buscarPorId(id: number): Observable<Aluno> {
    return this.http.get<Aluno>(`${this.endpoint}/${id}`);
  }

  criar(dados: FormData): Observable<Aluno> {
    return this.http.post<Aluno>(this.endpoint, dados);
  }

  atualizar(id: number, dados: FormData): Observable<Aluno> {
    return this.http.put<Aluno>(`${this.endpoint}/${id}`, dados);
  }
}