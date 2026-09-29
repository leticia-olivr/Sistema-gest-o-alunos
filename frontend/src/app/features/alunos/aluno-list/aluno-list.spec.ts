import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AlunoList } from './aluno-list';

describe('AlunoList', () => {
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AlunoList],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    stubLocalStorage();
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    vi.unstubAllGlobals();
  });

  it('loads the first page with 10 active students by default', () => {
    const fixture = TestBed.createComponent(AlunoList);
    fixture.detectChanges();

    const request = httpTestingController.expectOne((httpRequest) =>
      httpRequest.url === '/api/alunos'
      && httpRequest.params.get('page') === '0'
      && httpRequest.params.get('size') === '10'
      && httpRequest.params.get('status') === 'ATIVOS',
    );
    request.flush({
      content: [createAluno(1, 'Ana Souza')],
      page: 0,
      size: 10,
      totalElements: 21,
      totalPages: 3,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Ana Souza');
    expect(fixture.nativeElement.textContent).toContain('1–10 de 21 alunos');
    expect(fixture.nativeElement.textContent).toContain('Página 1 de 3');
  });

  it('sends the selected status and requested page to the API', () => {
    const fixture = TestBed.createComponent(AlunoList);
    fixture.detectChanges();
    httpTestingController.expectOne((httpRequest) =>
      httpRequest.url === '/api/alunos'
      && httpRequest.params.get('page') === '0'
      && httpRequest.params.get('size') === '10'
      && httpRequest.params.get('status') === 'ATIVOS',
    ).flush({
      content: Array.from({ length: 10 }, (_, index) => createAluno(index + 1, `Aluno ${index + 1}`)),
      page: 0,
      size: 10,
      totalElements: 21,
      totalPages: 3,
    });

    fixture.componentInstance.alterarStatus('TODOS');
    const allStatusesRequest = httpTestingController.expectOne((httpRequest) =>
      httpRequest.url === '/api/alunos' && httpRequest.params.get('status') === 'TODOS',
    );
    allStatusesRequest.flush({
      content: Array.from({ length: 10 }, (_, index) => createAluno(index + 1, `Aluno ${index + 1}`)),
      page: 0,
      size: 10,
      totalElements: 21,
      totalPages: 3,
    });

    fixture.componentInstance.irParaPagina(1);
    const nextPageRequest = httpTestingController.expectOne((httpRequest) =>
      httpRequest.url === '/api/alunos'
      && httpRequest.params.get('status') === 'TODOS'
      && httpRequest.params.get('page') === '1'
      && httpRequest.params.get('size') === '10',
    );
    nextPageRequest.flush({
      content: [createAluno(11, 'Zoe Lima')],
      page: 1,
      size: 10,
      totalElements: 21,
      totalPages: 3,
    });

    expect(fixture.componentInstance.pagina()).toBe(1);
    expect(fixture.componentInstance.primeiroResultado()).toBe(11);
  });
});

function createAluno(id: number, nome: string) {
  return {
    id,
    matricula: `A26${String(id).padStart(16, '0')}`,
    nome,
    email: `aluno${id}@example.com`,
    cpf: '52998224725',
    telefone: '11987654321',
    ativo: true,
    dataCriacao: '2026-09-29T12:00:00',
    fotoUrl: null,
  };
}

function stubLocalStorage(): void {
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
    clear: () => storage.clear(),
  });
}