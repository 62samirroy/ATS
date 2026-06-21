import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReportService } from '../../services/report.service';
import { InterviewService } from '../../services/interview.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="animate-fade-in" style="display:flex;flex-direction:column;gap:1.25rem">

      <!-- Header -->
      <div class="page-header" style="margin-bottom:0">
        <div>
          <h1 class="page-title">Welcome back, <span style="color:var(--primary)">{{ user?.name?.split(' ')[0] }}</span> 👋</h1>
          <p class="page-subtitle">Here's what's happening with your hiring today.</p>
        </div>
        <a routerLink="/jobs/create" id="btn-create-job" class="btn-primary">
          <i class="fa-solid fa-plus" style="font-size:0.75rem"></i> Post a Job
        </a>
      </div>

      <!-- Stat Cards -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:0.875rem">
        <ng-container *ngIf="loading">
          <div *ngFor="let i of [1,2,3,4,5,6]" class="stat-card skeleton" style="height:80px"></div>
        </ng-container>

        <ng-container *ngIf="!loading && stats">
          <div class="stat-card" style="border-top:3px solid #1976D2">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem">
              <span style="font-size:0.6875rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.04em">Total Jobs</span>
              <div style="width:30px;height:30px;background:#EEF6FF;border-radius:6px;display:flex;align-items:center;justify-content:center">
                <i class="fa-solid fa-briefcase" style="font-size:0.75rem;color:#1976D2"></i>
              </div>
            </div>
            <div style="font-size:1.75rem;font-weight:800;color:var(--text);line-height:1">{{ stats.totalJobs }}</div>
            <div style="font-size:0.6875rem;color:#1976D2;margin-top:4px">Active openings</div>
          </div>

          <div class="stat-card" style="border-top:3px solid #7C3AED">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem">
              <span style="font-size:0.6875rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.04em">Candidates</span>
              <div style="width:30px;height:30px;background:#F5F3FF;border-radius:6px;display:flex;align-items:center;justify-content:center">
                <i class="fa-solid fa-users" style="font-size:0.75rem;color:#7C3AED"></i>
              </div>
            </div>
            <div style="font-size:1.75rem;font-weight:800;color:var(--text);line-height:1">{{ stats.totalCandidates }}</div>
            <div style="font-size:0.6875rem;color:#7C3AED;margin-top:4px">In pipeline</div>
          </div>

          <div class="stat-card" style="border-top:3px solid #D97706">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem">
              <span style="font-size:0.6875rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.04em">Shortlisted</span>
              <div style="width:30px;height:30px;background:#FFFBEB;border-radius:6px;display:flex;align-items:center;justify-content:center">
                <i class="fa-solid fa-star" style="font-size:0.75rem;color:#D97706"></i>
              </div>
            </div>
            <div style="font-size:1.75rem;font-weight:800;color:var(--text);line-height:1">{{ stats.shortlisted }}</div>
            <div style="font-size:0.6875rem;color:#D97706;margin-top:4px">AI shortlisted</div>
          </div>

          <div class="stat-card" style="border-top:3px solid #1976D2">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem">
              <span style="font-size:0.6875rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.04em">Interviews</span>
              <div style="width:30px;height:30px;background:#EEF6FF;border-radius:6px;display:flex;align-items:center;justify-content:center">
                <i class="fa-regular fa-calendar-check" style="font-size:0.75rem;color:#1976D2"></i>
              </div>
            </div>
            <div style="font-size:1.75rem;font-weight:800;color:var(--text);line-height:1">{{ stats.todaysInterviews }}</div>
            <div style="font-size:0.6875rem;color:#1976D2;margin-top:4px">Today</div>
          </div>

          <div class="stat-card" style="border-top:3px solid #16A34A">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem">
              <span style="font-size:0.6875rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.04em">Offers</span>
              <div style="width:30px;height:30px;background:#F0FDF4;border-radius:6px;display:flex;align-items:center;justify-content:center">
                <i class="fa-solid fa-circle-check" style="font-size:0.75rem;color:#16A34A"></i>
              </div>
            </div>
            <div style="font-size:1.75rem;font-weight:800;color:var(--text);line-height:1">{{ stats.offered }}</div>
            <div style="font-size:0.6875rem;color:#16A34A;margin-top:4px">Sent this month</div>
          </div>

          <div class="stat-card" style="border-top:3px solid #0D9488">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem">
              <span style="font-size:0.6875rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.04em">Hired</span>
              <div style="width:30px;height:30px;background:#F0FDFA;border-radius:6px;display:flex;align-items:center;justify-content:center">
                <i class="fa-solid fa-user-check" style="font-size:0.75rem;color:#0D9488"></i>
              </div>
            </div>
            <div style="font-size:1.75rem;font-weight:800;color:var(--text);line-height:1">{{ stats.hired }}</div>
            <div style="font-size:0.6875rem;color:#0D9488;margin-top:4px">Successful hires</div>
          </div>
        </ng-container>
      </div>

      <!-- Charts Row -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">

        <!-- Hiring Funnel -->
        <div class="card">
          <h3 style="font-size:0.9375rem;font-weight:700;color:var(--text);margin-bottom:1rem">Hiring Funnel</h3>
          <div style="display:flex;flex-direction:column;gap:0.625rem" *ngIf="stats">
            <ng-container *ngFor="let stage of funnelStages">
              <div style="display:flex;align-items:center;gap:0.625rem">
                <span style="font-size:0.75rem;color:var(--muted);width:72px;flex-shrink:0">{{ stage.label }}</span>
                <div style="flex:1;height:8px;background:#F1F5F9;border-radius:9999px;overflow:hidden">
                  <div [style.width.%]="stage.pct" [style.background]="stage.color" style="height:100%;border-radius:9999px;transition:width 0.6s ease"></div>
                </div>
                <span style="font-size:0.75rem;font-weight:700;color:var(--text);width:24px;text-align:right">{{ stage.count }}</span>
              </div>
            </ng-container>
          </div>
        </div>

        <!-- Today's Interviews -->
        <div class="card">
          <h3 style="font-size:0.9375rem;font-weight:700;color:var(--text);margin-bottom:1rem">Today's Interviews</h3>
          <div *ngIf="loadingInterviews" style="display:flex;flex-direction:column;gap:0.5rem">
            <div *ngFor="let i of [1,2,3]" class="skeleton" style="height:44px"></div>
          </div>
          <div *ngIf="!loadingInterviews && todaysInterviews.length === 0" style="text-align:center;padding:2rem;color:var(--muted)">
            <i class="fa-regular fa-calendar" style="font-size:2rem;color:var(--border);display:block;margin-bottom:0.5rem"></i>
            <p style="font-size:0.875rem">No interviews today</p>
          </div>
          <div style="display:flex;flex-direction:column;gap:0.375rem" *ngIf="!loadingInterviews">
            <div *ngFor="let interview of todaysInterviews"
                 style="display:flex;align-items:center;gap:0.625rem;padding:0.5rem 0.75rem;background:#F8FAFC;border:1px solid var(--border);border-radius:6px">
              <div class="avatar" style="width:30px;height:30px;font-size:0.75rem;flex-shrink:0">{{ interview.candidateId?.name?.charAt(0) || '?' }}</div>
              <div style="flex:1;min-width:0">
                <p style="font-size:0.8125rem;font-weight:600;color:var(--text);margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ interview.candidateId?.name }}</p>
                <p style="font-size:0.6875rem;color:var(--muted);margin:0">{{ interview.type }} · {{ interview.scheduledDate | date:'shortTime' }}</p>
              </div>
              <span class="badge badge-blue" style="font-size:0.6rem">{{ interview.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.875rem">
        <a routerLink="/jobs/create" class="card-hover" style="display:flex;align-items:center;gap:0.75rem;padding:0.875rem 1rem;text-decoration:none">
          <div style="width:36px;height:36px;background:#EEF6FF;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <i class="fa-solid fa-plus" style="color:#1976D2;font-size:0.875rem"></i>
          </div>
          <span style="font-size:0.8125rem;font-weight:600;color:var(--text)">Post Job</span>
        </a>
        <a routerLink="/candidates" class="card-hover" style="display:flex;align-items:center;gap:0.75rem;padding:0.875rem 1rem;text-decoration:none">
          <div style="width:36px;height:36px;background:#F5F3FF;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <i class="fa-solid fa-users" style="color:#7C3AED;font-size:0.875rem"></i>
          </div>
          <span style="font-size:0.8125rem;font-weight:600;color:var(--text)">Candidates</span>
        </a>
        <a routerLink="/interviews" class="card-hover" style="display:flex;align-items:center;gap:0.75rem;padding:0.875rem 1rem;text-decoration:none">
          <div style="width:36px;height:36px;background:#ECFDF5;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <i class="fa-regular fa-calendar-check" style="color:#16A34A;font-size:0.875rem"></i>
          </div>
          <span style="font-size:0.8125rem;font-weight:600;color:var(--text)">Schedule</span>
        </a>
        <a routerLink="/ai" class="card-hover" style="display:flex;align-items:center;gap:0.75rem;padding:0.875rem 1rem;text-decoration:none">
          <div style="width:36px;height:36px;background:#FFFBEB;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <i class="fa-solid fa-microchip" style="color:#D97706;font-size:0.875rem"></i>
          </div>
          <span style="font-size:0.8125rem;font-weight:600;color:var(--text)">AI Engine</span>
        </a>
      </div>

    </div>
  `
})
export class DashboardComponent implements OnInit {
  stats: any;
  todaysInterviews: any[] = [];
  loading = true;
  loadingInterviews = true;
  user: any = null;

  get funnelStages() {
    if (!this.stats) return [];
    const total = this.stats.totalCandidates || 1;
    return [
      { label: 'Applied',    count: this.stats.totalApplications || 0, pct: 100,                                       color: '#1976D2' },
      { label: 'Screening',  count: this.stats.shortlisted || 0,       pct: (this.stats.shortlisted/total)*100,        color: '#7C3AED' },
      { label: 'Interview',  count: this.stats.totalInterviews || 0,   pct: (this.stats.totalInterviews/total)*100,    color: '#D97706' },
      { label: 'Offered',    count: this.stats.offered || 0,           pct: (this.stats.offered/total)*100,            color: '#16A34A' },
      { label: 'Hired',      count: this.stats.hired || 0,             pct: (this.stats.hired/total)*100,              color: '#0D9488' },
    ];
  }

  constructor(
    private reportService: ReportService,
    private interviewService: InterviewService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.user = this.authService.currentUser;
    this.reportService.getDashboardStats().subscribe({
      next: data => { this.stats = data; this.loading = false; },
      error: () => {
        this.stats = { totalJobs: 12, totalCandidates: 248, totalApplications: 189, totalInterviews: 34, shortlisted: 67, offered: 15, hired: 8, todaysInterviews: 4 };
        this.loading = false;
      }
    });
    this.interviewService.getTodaysInterviews().subscribe({
      next: data => { this.todaysInterviews = data; this.loadingInterviews = false; },
      error: () => { this.loadingInterviews = false; }
    });
  }
}
