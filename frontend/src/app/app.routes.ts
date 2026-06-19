import { Routes } from '@angular/router';
import { authGuard, publicGuard, roleGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // Auth routes (public only)
  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () => import('./pages/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [publicGuard],
    loadComponent: () => import('./pages/auth/register.component').then(m => m.RegisterComponent)
  },

  // Protected routes (inside layout)
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'jobs',
        loadComponent: () => import('./pages/jobs/jobs.component').then(m => m.JobsComponent)
      },
      {
        path: 'jobs/create',
        canActivate: [roleGuard('HR Manager', 'Super Admin')],
        loadComponent: () => import('./pages/jobs/job-form.component').then(m => m.JobFormComponent)
      },
      {
        path: 'jobs/:id/edit',
        canActivate: [roleGuard('HR Manager', 'Super Admin')],
        loadComponent: () => import('./pages/jobs/job-form.component').then(m => m.JobFormComponent)
      },
      {
        path: 'candidates',
        canActivate: [roleGuard('HR Manager', 'Super Admin', 'Interviewer')],
        loadComponent: () => import('./pages/candidates/candidates.component').then(m => m.CandidatesComponent)
      },
      {
        path: 'applications',
        loadComponent: () => import('./pages/applications/applications.component').then(m => m.ApplicationsComponent)
      },
      {
        path: 'my-applications',
        loadComponent: () => import('./pages/applications/applications.component').then(m => m.ApplicationsComponent)
      },
      {
        path: 'interviews',
        loadComponent: () => import('./pages/interviews/interviews.component').then(m => m.InterviewsComponent)
      },
      {
        path: 'ai',
        canActivate: [roleGuard('HR Manager', 'Super Admin')],
        loadComponent: () => import('./pages/ai/ai-engine.component').then(m => m.AiEngineComponent)
      },
      {
        path: 'reports',
        canActivate: [roleGuard('HR Manager', 'Super Admin')],
        loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./pages/notifications/notifications.component').then(m => m.NotificationsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'admin',
        canActivate: [roleGuard('Super Admin')],
        loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent)
      },
    ]
  },

  // Wildcard
  { path: '**', redirectTo: 'dashboard' }
];
