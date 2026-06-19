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
    <div class="space-y-6 animate-fade-in">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Welcome back, <span class="text-gradient">{{ user?.name?.split(' ')[0] }}</span> 👋</h1>
          <p class="page-subtitle">Here's what's happening with your hiring today.</p>
        </div>
        <div class="flex gap-3">
          <a routerLink="/jobs/create" id="btn-create-job" class="btn-primary">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Post a Job
          </a>
        </div>
      </div>

      <!-- Stat Cards -->
      <div *ngIf="loading" class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div *ngFor="let i of [1,2,3,4,5,6]" class="stat-card">
          <div class="skeleton h-4 w-24 rounded"></div>
          <div class="skeleton h-8 w-16 rounded mt-1"></div>
        </div>
      </div>

      <div *ngIf="!loading && stats" class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div class="stat-card hover:border-blue-500/30 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Jobs</span>
            <div class="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-white">{{ stats.totalJobs }}</div>
          <div class="text-xs text-blue-400">Active openings</div>
        </div>

        <div class="stat-card hover:border-violet-500/30 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400 font-medium uppercase tracking-wider">Candidates</span>
            <div class="w-8 h-8 bg-violet-500/10 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-white">{{ stats.totalCandidates }}</div>
          <div class="text-xs text-violet-400">In pipeline</div>
        </div>

        <div class="stat-card hover:border-amber-500/30 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400 font-medium uppercase tracking-wider">Shortlisted</span>
            <div class="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-white">{{ stats.shortlisted }}</div>
          <div class="text-xs text-amber-400">AI shortlisted</div>
        </div>

        <div class="stat-card hover:border-primary-500/30 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400 font-medium uppercase tracking-wider">Interviews</span>
            <div class="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-white">{{ stats.todaysInterviews }}</div>
          <div class="text-xs text-primary-400">Today</div>
        </div>

        <div class="stat-card hover:border-emerald-500/30 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400 font-medium uppercase tracking-wider">Offers</span>
            <div class="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-white">{{ stats.offered }}</div>
          <div class="text-xs text-emerald-400">Sent this month</div>
        </div>

        <div class="stat-card hover:border-green-500/30 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400 font-medium uppercase tracking-wider">Hired</span>
            <div class="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-white">{{ stats.hired }}</div>
          <div class="text-xs text-green-400">Successful hires</div>
        </div>
      </div>

      <!-- Charts row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Hiring Funnel -->
        <div class="card">
          <h3 class="text-base font-semibold text-white mb-4">Hiring Funnel</h3>
          <div class="space-y-3" *ngIf="stats">
            <ng-container *ngFor="let stage of funnelStages">
              <div class="flex items-center gap-3">
                <span class="text-xs text-slate-400 w-24 flex-shrink-0">{{ stage.label }}</span>
                <div class="flex-1 ai-score-bar">
                  <div class="ai-score-fill" [style.width.%]="stage.pct" [style.background]="stage.color"></div>
                </div>
                <span class="text-sm font-semibold text-white w-8 text-right">{{ stage.count }}</span>
              </div>
            </ng-container>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="card">
          <h3 class="text-base font-semibold text-white mb-4">Today's Interviews</h3>
          <div *ngIf="loadingInterviews" class="space-y-3">
            <div *ngFor="let i of [1,2,3]" class="skeleton h-14 rounded-xl"></div>
          </div>
          <div *ngIf="!loadingInterviews && todaysInterviews.length === 0" class="flex flex-col items-center justify-center py-8 text-slate-500">
            <svg class="w-10 h-10 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            <p class="text-sm">No interviews scheduled today</p>
          </div>
          <div class="space-y-2" *ngIf="!loadingInterviews">
            <div *ngFor="let interview of todaysInterviews" class="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl hover:bg-slate-800/60 transition-colors">
              <div class="avatar w-9 h-9 text-sm flex-shrink-0">{{ interview.candidateId?.name?.charAt(0) || '?' }}</div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white truncate">{{ interview.candidateId?.name }}</p>
                <p class="text-xs text-slate-400">{{ interview.type }} • {{ interview.scheduledDate | date:'shortTime' }}</p>
              </div>
              <span class="badge badge-blue">{{ interview.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <a routerLink="/jobs/create" class="card-hover flex flex-col items-center gap-2 py-5 text-center cursor-pointer">
          <div class="w-12 h-12 bg-primary-600/20 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          </div>
          <span class="text-sm font-medium text-white">Post Job</span>
        </a>
        <a routerLink="/candidates" class="card-hover flex flex-col items-center gap-2 py-5 text-center cursor-pointer">
          <div class="w-12 h-12 bg-violet-600/20 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <span class="text-sm font-medium text-white">View Candidates</span>
        </a>
        <a routerLink="/interviews" class="card-hover flex flex-col items-center gap-2 py-5 text-center cursor-pointer">
          <div class="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </div>
          <span class="text-sm font-medium text-white">Schedule Interview</span>
        </a>
        <a routerLink="/ai" class="card-hover flex flex-col items-center gap-2 py-5 text-center cursor-pointer">
          <div class="w-12 h-12 bg-amber-600/20 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
          </div>
          <span class="text-sm font-medium text-white">AI Engine</span>
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
      { label: 'Applied', count: this.stats.totalApplications || 0, pct: 100, color: '#6366f1' },
      { label: 'Screening', count: this.stats.shortlisted || 0, pct: (this.stats.shortlisted / total) * 100, color: '#8b5cf6' },
      { label: 'Interview', count: this.stats.totalInterviews || 0, pct: (this.stats.totalInterviews / total) * 100, color: '#f59e0b' },
      { label: 'Offered', count: this.stats.offered || 0, pct: (this.stats.offered / total) * 100, color: '#10b981' },
      { label: 'Hired', count: this.stats.hired || 0, pct: (this.stats.hired / total) * 100, color: '#22c55e' },
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
        // Use mock data if backend not connected
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
