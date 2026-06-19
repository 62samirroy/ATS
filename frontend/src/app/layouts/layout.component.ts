import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles?: string[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex h-screen bg-dark-950 overflow-hidden">
      <!-- Sidebar -->
      <aside [class.translate-x-0]="sidebarOpen" [class.-translate-x-full]="!sidebarOpen && isMobile"
             class="fixed lg:relative z-40 inset-y-0 left-0 flex flex-col w-64 bg-dark-900 border-r border-slate-800/60 transition-transform duration-300 lg:translate-x-0">
        <!-- Logo -->
        <div class="flex items-center gap-3 px-6 py-5 border-b border-slate-800/60">
          <div class="w-9 h-9 bg-primary-600/20 rounded-xl flex items-center justify-center glow">
            <svg class="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <div>
            <h1 class="text-base font-bold text-white leading-none">HireFlow</h1>
            <p class="text-xs text-primary-400 font-medium">AI</p>
          </div>
          <button (click)="sidebarOpen=false" class="ml-auto lg:hidden text-slate-400">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Nav -->
        <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto no-scrollbar">
          <ng-container *ngFor="let item of navItems">
            <a *ngIf="canShow(item)"
               [routerLink]="item.route"
               [class.active]="isActive(item.route)"
               class="sidebar-item"
               (click)="sidebarOpen=false">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.icon"/>
              </svg>
              {{ item.label }}
            </a>
          </ng-container>
        </nav>

        <!-- User profile -->
        <div class="px-4 py-4 border-t border-slate-800/60">
          <div class="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-slate-800/40 transition-colors cursor-pointer" (click)="router.navigate(['/profile'])">
            <div class="avatar w-8 h-8 text-sm flex-shrink-0">
              {{ (currentUser?.name || 'U').charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-white truncate">{{ currentUser?.name }}</p>
              <p class="text-xs text-slate-500 truncate">{{ currentUser?.role }}</p>
            </div>
          </div>
          <button (click)="logout()" id="sidebar-logout" class="mt-2 w-full sidebar-item text-red-400 hover:text-red-300 hover:bg-red-900/20">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      <!-- Sidebar overlay (mobile) -->
      <div *ngIf="sidebarOpen && isMobile" class="fixed inset-0 z-30 bg-black/50" (click)="sidebarOpen=false"></div>

      <!-- Main content -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Top bar -->
        <header class="flex items-center gap-4 px-6 py-4 border-b border-slate-800/60 bg-dark-900/80 backdrop-blur-sm">
          <button (click)="sidebarOpen=!sidebarOpen" class="lg:hidden text-slate-400 hover:text-white">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          <!-- Breadcrumb -->
          <div class="flex-1">
            <h2 class="text-sm font-semibold text-white capitalize">{{ getPageTitle() }}</h2>
          </div>

          <!-- Notifications -->
          <button (click)="router.navigate(['/notifications'])" id="notif-btn" class="relative p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-white transition-all">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <ng-container *ngIf="(notifCount$ | async) as count">
              <span class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{{ $any(count) > 9 ? '9+' : count }}</span>
            </ng-container>
          </button>

          <!-- User avatar -->
          <button (click)="router.navigate(['/profile'])" class="avatar w-9 h-9 text-sm cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all flex-shrink-0">
            {{ (currentUser?.name || 'U').charAt(0).toUpperCase() }}
          </button>
        </header>

        <!-- Page content -->
        <main class="flex-1 overflow-y-auto p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class LayoutComponent implements OnInit {
  sidebarOpen = false;
  isMobile = false;
  currentUrl = '';


  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'Jobs', route: '/jobs', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { label: 'Candidates', route: '/candidates', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', roles: ['HR Manager', 'Super Admin', 'Interviewer'] },
    { label: 'Applications', route: '/applications', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { label: 'Interviews', route: '/interviews', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { label: 'AI Engine', route: '/ai', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1', roles: ['HR Manager', 'Super Admin'] },
    { label: 'Reports', route: '/reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', roles: ['HR Manager', 'Super Admin'] },
    { label: 'Notifications', route: '/notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { label: 'My Applications', route: '/my-applications', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', roles: ['Candidate'] },
    { label: 'Admin Panel', route: '/admin', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4', roles: ['Super Admin'] },
    { label: 'Profile', route: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  private authService = inject<AuthService>(AuthService);
  public router = inject<Router>(Router);
  private notifService = inject<NotificationService>(NotificationService);

  currentUser: any = null;
  notifCount$: any = null;

  logout() { this.authService.logout(); }
  get userRole() { return this.authService.userRole; }
  canShow(item: NavItem): boolean {
    if (!item.roles) return true;
    return item.roles.includes(this.authService.userRole);
  }

  ngOnInit() {
    this.currentUser = this.authService.currentUser;
    this.notifCount$ = this.notifService.unreadCount$;
    this.isMobile = window.innerWidth < 1024;
    this.notifService.getUnreadCount();
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.currentUrl = e.url;
    });
    this.currentUrl = this.router.url;
  }


  isActive(route: string): boolean {
    return this.currentUrl === route || this.currentUrl.startsWith(route + '/');
  }

  getPageTitle(): string {
    const item = this.navItems.find(n => this.isActive(n.route));
    return item?.label || 'HireFlow AI';
  }

}
