import { Routes } from '@angular/router';

import { authGuard } from './guards/auth-guard';
import { publicGuard } from './guards/public-guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
    { 
        path: '', 
        redirectTo: '/login', 
        pathMatch: 'full'
    },
    { 
        path: 'login', 
        loadComponent: () => import('./pages/login/login').then(m => m.Login),
        canActivate: [publicGuard]
    },
    { 
        path: 'registro', 
        loadComponent: () => import('./pages/register/register').then(m => m.Register),
        canActivate: [publicGuard]
    },
    { 
        path: 'publicaciones', 
        loadComponent: () => import('./pages/publications/publications').then(m => m.Publications),
        canActivate: [authGuard]
    },
    { 
        path: 'publicacion/:id', 
        loadComponent: () => import('./pages/publication-detail/publication-detail').then(m => m.PublicationDetail),
        canActivate: [authGuard]
    },
    { 
        path: 'perfil', 
        loadComponent: () => import('./pages/profile/profile').then(m => m.Profile),
        canActivate: [authGuard]
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard/dashboard').then(m => m.DashboardComponent),
        canActivate: [authGuard, adminGuard],
        children: [
            {
                path: 'users',
                loadComponent: () => import('./pages/dashboard/users/users').then(m => m.UsersComponent)
            },
            {
                path: 'statistics',
                loadComponent: () => import('./pages/dashboard/statistics/statistics').then(m => m.StatisticsComponent)
            },
            {
                path: '',
                redirectTo: 'users',
                pathMatch: 'full'
            }
        ]
    }
];
