import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Public auth routes
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/register/register').then(m => m.RegisterComponent)
  },

  // Public invitation route
  {
    path: 'invitation/:token',
    loadComponent: () => import('./pages/invitations/accept/accept-invitation').then(m => m.AcceptInvitationComponent)
  },
  {
    path: 'invites/:token',
    loadComponent: () => import('./pages/invitations/accept/accept-invitation').then(m => m.AcceptInvitationComponent)
  },

  // Protected routes inside layout shell
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/layout').then(m => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'projects/:id',
        loadComponent: () => import('./pages/projects/detail/project-detail').then(m => m.ProjectDetailComponent)
      },
      {
        path: 'projects/:id/tasks/new',
        loadComponent: () => import('./pages/tasks/create-task/create-task').then(m => m.CreateTaskComponent)
      },
      {
        path: 'tasks/:id',
        loadComponent: () => import('./pages/tasks/task-detail/task-detail').then(m => m.TaskDetailComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./pages/notifications/notifications').then(m => m.NotificationsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile').then(m => m.ProfileComponent)
      }
    ]
  },

  { path: '**', redirectTo: '/dashboard' }
];
