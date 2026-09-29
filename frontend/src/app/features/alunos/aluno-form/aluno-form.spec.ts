import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AlunoForm } from './aluno-form';

describe('AlunoForm', () => {
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AlunoForm],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('does not send invalid data to the API', () => {
    const fixture = TestBed.createComponent(AlunoForm);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.form.controls.nome.setValue('A1');
    component.form.controls.email.setValue('email-invalido');
    component.form.controls.cpf.setValue('111.111.111-11');
    component.form.controls.telefone.setValue('(00) 1234-5678');

    component.salvar();

    expect(component.form.invalid).toBe(true);
    expect(component.form.controls.nome.touched).toBe(true);
    httpTestingController.expectNone('/api/alunos');
  });

  it('sends valid student data as multipart without accepting a matrícula', () => {
    const fixture = TestBed.createComponent(AlunoForm);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.form.controls.nome.setValue('Ana Souza');
    component.form.controls.email.setValue('ana@example.com');
    component.form.controls.cpf.setValue('529.982.247-25');
    component.form.controls.telefone.setValue('(11) 98765-4321');

    component.salvar();

    const request = httpTestingController.expectOne('/api/alunos');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeInstanceOf(FormData);
    expect(request.request.body.get('cpf')).toBe('529.982.247-25');
    expect(request.request.body.get('matricula')).toBeNull();
    request.flush({
      id: 1,
      matricula: 'A26A1B2C3D4E5F60718',
      nome: 'Ana Souza',
      email: 'ana@example.com',
      cpf: '52998224725',
      telefone: '11987654321',
      ativo: true,
      dataCriacao: '2026-09-29T12:00:00',
      fotoUrl: null,
    });

    expect(component.sucesso()).toContain('A26A1B2C3D4E5F60718');
  });
});