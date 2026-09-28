import { Routes } from '@angular/router';
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
			{ path: '**', redirectTo: 'inicio' },
		],
	},
	{ path: '**', redirectTo: '' },
];
