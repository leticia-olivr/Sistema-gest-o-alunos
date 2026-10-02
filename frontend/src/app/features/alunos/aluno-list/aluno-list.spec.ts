import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { AlunoList } from './aluno-list';

describe('AlunoList', () => {
  let httpTestingController: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AlunoList],
      providers: [provideRouter([{ path: 'alunos', component: AlunoList }]), provideHttpClient(), provideHttpClientTesting()],
    });
    stubLocalStorage();
    router = TestBed.inject(Router);
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
    expect(fixture.nativeElement.textContent).not.toContain('Página 1 de 3');
    expect(fixture.nativeElement.querySelectorAll('.page-controls button[aria-current="page"]').length).toBe(1);
    expect(fixture.nativeElement.querySelector('.page-controls button[aria-label="Página anterior"]')?.textContent.trim()).toBe('<');
    expect(fixture.nativeElement.querySelector('.page-controls button[aria-label="Próxima página"]')?.textContent.trim()).toBe('>');
    expect(fixture.nativeElement.textContent).not.toContain('Anterior');
    expect(fixture.nativeElement.textContent).not.toContain('Próxima');
    expect(fixture.nativeElement.textContent).toContain('1');
    expect(fixture.nativeElement.textContent).toContain('2');
    expect(fixture.nativeElement.textContent).toContain('3');
  });

  it('shows the correct range and current page on the final page', () => {
    const fixture = TestBed.createComponent(AlunoList);
    fixture.detectChanges();
    httpTestingController.expectOne((httpRequest) => httpRequest.url === '/api/alunos').flush({
      content: Array.from({ length: 4 }, (_, index) => createAluno(index + 21, `Aluno ${index + 21}`)),
      page: 2,
      size: 10,
      totalElements: 24,
      totalPages: 3,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('21–24 de 24 alunos');
    expect(fixture.nativeElement.textContent).not.toContain('Página 3 de 3');
    expect(fixture.nativeElement.querySelector('.page-controls button[aria-current="page"]')?.textContent.trim()).toBe('3');
    expect(fixture.nativeElement.querySelector('.page-controls button[aria-label="Página anterior"]')?.disabled).toBe(false);
    expect(fixture.nativeElement.querySelector('.page-controls button[aria-label="Próxima página"]')?.disabled).toBe(true);
  });

  it('shows the created matrícula after returning to the list', async () => {
    await router.navigateByUrl('/alunos?matriculaCriada=20260001');
    const fixture = TestBed.createComponent(AlunoList);
    fixture.detectChanges();
    httpTestingController.expectOne((httpRequest) => httpRequest.url === '/api/alunos').flush({
      content: [createAluno(1, 'Ana Souza')],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Cadastro realizado. Matrícula: 20260001.');
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

  it('restores the list state from the URL query string', async () => {
    await router.navigateByUrl('/alunos?busca=Ana&status=TODOS&page=2');
    const fixture = TestBed.createComponent(AlunoList);
    fixture.detectChanges();

    const request = httpTestingController.expectOne((httpRequest) =>
      httpRequest.url === '/api/alunos'
      && httpRequest.params.get('busca') === 'Ana'
      && httpRequest.params.get('status') === 'TODOS'
      && httpRequest.params.get('page') === '2'
      && httpRequest.params.get('size') === '10',
    );
    request.flush({
      content: [createAluno(1, 'Ana Souza')],
      page: 2,
      size: 10,
      totalElements: 21,
      totalPages: 3,
    });

    expect(fixture.componentInstance.busca.value).toBe('Ana');
    expect(fixture.componentInstance.status()).toBe('TODOS');
    expect(fixture.componentInstance.pagina()).toBe(2);
  });

  it('keeps the current filters in the URL while navigating between pages', () => {
    const fixture = TestBed.createComponent(AlunoList);
    fixture.detectChanges();
    httpTestingController.expectOne((httpRequest) => httpRequest.url === '/api/alunos').flush({
      content: [createAluno(1, 'Ana Souza')],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });

    fixture.componentInstance.busca.setValue('Ana');
    fixture.componentInstance.alterarStatus('TODOS');

    expect(router.url).toContain('busca=Ana');
    expect(router.url).toContain('status=TODOS');
  });

  it('inactivates an active student after confirmation and refreshes the list', () => {
    vi.stubGlobal('confirm', () => true);
    const fixture = TestBed.createComponent(AlunoList);
    fixture.detectChanges();
    httpTestingController.expectOne((httpRequest) => httpRequest.url === '/api/alunos').flush({
      content: [createAluno(1, 'Ana Souza')],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });

    fixture.componentInstance.alternarStatusAluno(createAluno(1, 'Ana Souza'));

    const inativarRequest = httpTestingController.expectOne('/api/alunos/1/inativar');
    expect(inativarRequest.request.method).toBe('PATCH');
    inativarRequest.flush(null, { status: 204, statusText: 'No Content' });

    const reloadRequest = httpTestingController.expectOne((httpRequest) => httpRequest.url === '/api/alunos');
    reloadRequest.flush({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
  });
});

function createAluno(id: number, nome: string) {
  return {
    id,
    matricula: String(20260000 + id),
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