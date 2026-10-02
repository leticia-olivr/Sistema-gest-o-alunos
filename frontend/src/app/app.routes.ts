import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { alunoFormCanDeactivateGuard } from './core/guards/aluno-form-can-deactivate.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
	{
		path: 'login',
		loadComponent: () =>
			import('./features/auth/login/login').then((module) => module.Login),
	},
	{
		path: '',
		canActivate: [authGuard],
		loadComponent: () =>
			import('./layout/main-layout/main-layout').then((module) => module.MainLayout),
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'inicio',
			},
			{
				path: 'inicio',
				loadComponent: () =>
					import('./features/dashboard/dashboard').then((module) => module.Dashboard),
			},
			{
				path: 'alunos/novo',
				canActivate: [adminGuard],
				canDeactivate: [alunoFormCanDeactivateGuard],
				loadComponent: () =>
					import('./features/alunos/aluno-form/aluno-form').then((module) => module.AlunoForm),
			},
			{
				path: 'alunos',
				loadComponent: () =>
					import('./features/alunos/aluno-list/aluno-list').then((module) => module.AlunoList),
			},
			{
				path: 'alunos/:id',
				loadComponent: () =>
					import('./features/alunos/aluno-detalhes/aluno-detalhes').then((module) => module.AlunoDetalhes),
			},
			{
				path: 'alunos/:id/editar',
				canActivate: [adminGuard],
				canDeactivate: [alunoFormCanDeactivateGuard],
				loadComponent: () =>
					import('./features/alunos/aluno-form/aluno-form').then((module) => module.AlunoForm),
			},
			{ path: '**', redirectTo: 'inicio' },
		],
	},
	{ path: '**', redirectTo: '' },
];
