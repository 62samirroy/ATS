import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

interface NavItem { label: string; route: string; icon: string; roles?: string[]; }

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div style="display:flex;height:100vh;overflow:hidden;background:var(--bg)">

      <!-- ====== SIDEBAR (White + Blue) ====== -->
      <aside [class.translate-x-0]="sidebarOpen" [class.-translate-x-full]="!sidebarOpen && isMobile"
             style="width:220px;min-width:220px;background:#fff;border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;box-shadow:2px 0 8px rgba(26,43,76,0.04);transition:transform 0.3s"
             class="fixed lg:relative z-40 inset-y-0 left-0 lg:translate-x-0">

        <!-- Logo -->
        <div style="display:flex;align-items:center;gap:0.625rem;padding:0.875rem 1rem;border-bottom:1px solid var(--border)">
          <div style="width:34px;height:34px;background:var(--primary);border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
            </svg>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-size:0.9375rem;font-weight:700;color:var(--text)">HireFlow</div>
            <div style="font-size:0.6rem;color:var(--muted);font-weight:600;letter-spacing:0.06em;text-transform:uppercase">ATS Platform</div>
          </div>
          <button (click)="sidebarOpen=false" class="lg:hidden" style="background:none;border:none;cursor:pointer;color:var(--muted);padding:4px">
            <i class="fa-solid fa-xmark" style="font-size:1rem"></i>
          </button>
        </div>

        <!-- Nav -->
        <nav style="flex:1;padding:0.5rem 0.625rem;overflow-y:auto" class="no-scrollbar">
          <ng-container *ngFor="let item of navItems">
            <a *ngIf="canShow(item)"
               [routerLink]="item.route"
               class="sidebar-item"
               [class.active]="isActive(item.route)"
               (click)="sidebarOpen=false">
              <i [class]="item.icon"></i>
              {{ item.label }}
            </a>
          </ng-container>
        </nav>

        <!-- User + Sign Out -->
        <div style="padding:0.625rem;border-top:1px solid var(--border);background:#FAFBFC">
          <div style="display:flex;align-items:center;gap:0.5rem;padding:0.4375rem 0.5rem;border-radius:6px;cursor:pointer;transition:background 0.15s"
               (click)="router.navigate(['/profile'])"
               onmouseenter="this.style.background='#F1F5F9'"
               onmouseleave="this.style.background='transparent'">
            <div style="width:30px;height:30px;border-radius:50%;background:var(--primary-l);border:1.5px solid rgba(25,118,210,0.2);display:flex;align-items:center;justify-content:center;color:var(--primary);font-size:0.75rem;font-weight:700;flex-shrink:0">
              {{ (currentUser?.name || 'U').charAt(0).toUpperCase() }}
            </div>
            <div style="flex:1;min-width:0">
              <p style="font-size:0.8125rem;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:0">{{ currentUser?.name }}</p>
              <p style="font-size:0.6875rem;color:var(--muted);margin:0">{{ currentUser?.role }}</p>
            </div>
          </div>
          <button (click)="logout()" id="sidebar-logout"
                  style="display:flex;align-items:center;gap:0.5rem;width:100%;padding:0.375rem 0.5rem;border-radius:6px;background:none;border:none;cursor:pointer;font-size:0.8125rem;color:#DC2626;font-weight:500;margin-top:2px;transition:background 0.15s"
                  onmouseenter="this.style.background='#FEF2F2'"
                  onmouseleave="this.style.background='transparent'">
            <i class="fa-solid fa-arrow-right-from-bracket" style="font-size:0.75rem;width:14px;text-align:center"></i>
            Sign Out
          </button>
        </div>
      </aside>

      <!-- Overlay (mobile) -->
      <div *ngIf="sidebarOpen && isMobile" class="fixed inset-0 z-30 bg-black/30" (click)="sidebarOpen=false"></div>

      <!-- ====== MAIN CONTENT ====== -->
      <div style="flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden">
        <!-- Top Bar -->
        <header style="height:52px;min-height:52px;background:#fff;border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 1.25rem;gap:0.75rem">
          <button (click)="sidebarOpen=!sidebarOpen" class="lg:hidden"
                  style="background:none;border:none;cursor:pointer;color:var(--muted);padding:4px">
            <i class="fa-solid fa-bars" style="font-size:1.125rem"></i>
          </button>

          <h2 style="flex:1;font-size:1rem;font-weight:700;color:var(--text)">{{ getPageTitle() }}</h2>

          <!-- Notifications -->
          <button (click)="router.navigate(['/notifications'])" id="notif-btn"
                  style="position:relative;width:34px;height:34px;background:#F1F5F9;border:1px solid var(--border);border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--muted);transition:all 0.15s"
                  onmouseenter="this.style.background='var(--border)'"
                  onmouseleave="this.style.background='#F1F5F9'">
            <i class="fa-regular fa-bell" style="font-size:0.9375rem"></i>
            <ng-container *ngIf="(notifCount$ | async) as count">
              <span style="position:absolute;top:-4px;right:-4px;width:16px;height:16px;background:#DC2626;color:#fff;font-size:0.55rem;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700">{{ $any(count) > 9 ? '9+' : count }}</span>
            </ng-container>
          </button>

          <!-- Avatar -->
          <button (click)="router.navigate(['/profile'])"
                  style="width:34px;height:34px;border-radius:50%;background:var(--primary-l);border:1.5px solid rgba(25,118,210,0.2);display:flex;align-items:center;justify-content:center;color:var(--primary);font-size:0.8125rem;font-weight:700;cursor:pointer;transition:box-shadow 0.15s"
                  onmouseenter="this.style.boxShadow='0 0 0 3px rgba(25,118,210,0.15)'"
                  onmouseleave="this.style.boxShadow='none'">
            {{ (currentUser?.name || 'U').charAt(0).toUpperCase() }}
          </button>
        </header>

        <!-- Page -->
        <main style="flex:1;overflow-y:auto;padding:1.25rem">
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
    { label: 'Dashboard',       route: '/dashboard',       icon: 'fa-solid fa-chart-pie' },
    { label: 'Jobs',            route: '/jobs',            icon: 'fa-solid fa-briefcase' },
    { label: 'Candidates',      route: '/candidates',      icon: 'fa-solid fa-users',           roles: ['HR Manager', 'Super Admin', 'Interviewer'] },
    { label: 'Applications',    route: '/applications',    icon: 'fa-solid fa-file-lines' },
    { label: 'Interviews',      route: '/interviews',      icon: 'fa-regular fa-calendar-check' },
    { label: 'AI Engine',       route: '/ai',              icon: 'fa-solid fa-microchip',       roles: ['HR Manager', 'Super Admin'] },
    { label: 'Reports',         route: '/reports',         icon: 'fa-solid fa-chart-bar',       roles: ['HR Manager', 'Super Admin'] },
    { label: 'Notifications',   route: '/notifications',   icon: 'fa-solid fa-bell' },
    { label: 'My Applications', route: '/my-applications', icon: 'fa-solid fa-folder-open',     roles: ['Candidate'] },
    { label: 'Admin Panel',     route: '/admin',           icon: 'fa-solid fa-shield-halved',   roles: ['Super Admin'] },
    { label: 'Profile',         route: '/profile',         icon: 'fa-solid fa-user' },
  ];

  private authService = inject<AuthService>(AuthService);
  public router = inject<Router>(Router);
  private notifService = inject<NotificationService>(NotificationService);
  currentUser: any = null;
  notifCount$: any = null;

  logout() { this.authService.logout(); }
  canShow(item: NavItem): boolean { return !item.roles || item.roles.includes(this.authService.userRole); }

  ngOnInit() {
    this.currentUser = this.authService.currentUser;
    this.notifCount$ = this.notifService.unreadCount$;
    this.isMobile = window.innerWidth < 1024;
    this.notifService.getUnreadCount();
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => { this.currentUrl = e.url; });
    this.currentUrl = this.router.url;
  }

  isActive(route: string): boolean { return this.currentUrl === route || this.currentUrl.startsWith(route + '/'); }
  getPageTitle(): string { return this.navItems.find(n => this.isActive(n.route))?.label || 'HireFlow ATS'; }
}
