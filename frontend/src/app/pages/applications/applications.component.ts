import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../services/application.service';
import { JobService } from '../../services/job.service';
import { CandidateService } from '../../services/candidate.service';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">Applications Pipeline</h1>
          <p class="page-subtitle">Track candidates through the hiring pipeline</p>
        </div>
        <div class="flex gap-2">
          <button (click)="viewMode = 'kanban'" [class]="viewMode === 'kanban' ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/></svg>
            Kanban
          </button>
          <button (click)="viewMode = 'list'" [class]="viewMode === 'list' ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
            List
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="card">
        <div class="flex flex-wrap gap-3">
          <div class="search-bar flex-1 min-w-48">
            <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input type="text" [(ngModel)]="search" (input)="filterApps()" class="search-input" placeholder="Search candidate...">
          </div>
          <select [(ngModel)]="selectedJob" (change)="filterApps()" class="form-select w-48">
            <option value="">All Jobs</option>
            <option *ngFor="let j of jobs" [value]="j._id">{{ j.title }}</option>
          </select>
        </div>
      </div>

      <!-- Kanban View -->
      <div *ngIf="viewMode === 'kanban'" class="flex gap-4 overflow-x-auto pb-4">
        <div *ngFor="let stage of stages" class="pipeline-stage flex-shrink-0 w-56">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ stage.label }}</span>
            <span class="badge" [class]="stage.badgeClass">{{ getByStage(stage.key).length }}</span>
          </div>
          <div class="space-y-2">
            <div *ngFor="let app of getByStage(stage.key)" class="pipeline-card">
              <div class="flex items-center gap-2 mb-2">
                <div class="avatar w-7 h-7 text-xs flex items-center justify-center">{{ app.candidateId?.name?.charAt(0) || '?' }}</div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-white truncate">{{ app.candidateId?.name || 'Candidate' }}</p>
                </div>
              </div>
              <p class="text-xs text-slate-500 truncate mb-2">{{ app.jobId?.title || 'Job' }}</p>
              <div *ngIf="app.candidateId?.aiScore" class="mb-2">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-slate-500">AI Score</span>
                  <span class="text-xs font-bold" [class]="getScoreColor(app.candidateId.aiScore)">{{ app.candidateId.aiScore }}%</span>
                </div>
                <div class="ai-score-bar h-1">
                  <div class="ai-score-fill" [style.width.%]="app.candidateId.aiScore" [style.background]="getScoreGrad(app.candidateId.aiScore)"></div>
                </div>
              </div>
              <div class="flex gap-1">
                <button *ngFor="let action of getNextStages(stage.key)" (click)="moveStage(app, action.key)" class="flex-1 text-xs py-1 rounded-lg border transition-colors"
                        [class]="action.key === 'Rejected' ? 'border-red-600/30 text-red-400 hover:bg-red-600/10' : 'border-primary-600/30 text-primary-400 hover:bg-primary-600/10'">
                  {{ action.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div *ngIf="viewMode === 'list'" class="card p-0">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Job</th>
                <th>Applied</th>
                <th>Status</th>
                <th>AI Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="loading"><td colspan="6" class="text-center py-8 text-slate-500">Loading...</td></tr>
              <tr *ngFor="let app of filteredApps">
                <td>
                  <div class="flex items-center gap-2">
                    <div class="avatar w-8 h-8 text-xs flex items-center justify-center">{{ app.candidateId?.name?.charAt(0) || '?' }}</div>
                    <div>
                      <p class="font-medium text-white text-sm">{{ app.candidateId?.name || 'Unknown' }}</p>
                      <p class="text-xs text-slate-500">{{ app.candidateId?.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="text-sm text-slate-300">{{ app.jobId?.title || 'N/A' }}</td>
                <td class="text-sm text-slate-400">{{ app.appliedDate | date:'mediumDate' }}</td>
                <td><span [class]="getStatusBadge(app.status)">{{ app.status }}</span></td>
                <td>
                  <div *ngIf="app.candidateId?.aiScore" class="flex items-center gap-2">
                    <div class="w-16 ai-score-bar"><div class="ai-score-fill" [style.width.%]="app.candidateId.aiScore" [style.background]="getScoreGrad(app.candidateId.aiScore)"></div></div>
                    <span class="text-sm font-semibold" [class]="getScoreColor(app.candidateId.aiScore)">{{ app.candidateId.aiScore }}%</span>
                  </div>
                  <span *ngIf="!app.candidateId?.aiScore" class="text-slate-600 text-sm">Not ranked</span>
                </td>
                <td>
                  <select class="form-select text-xs py-1 w-32" [value]="app.status" (change)="moveStage(app, $any($event.target).value)">
                    <option *ngFor="let s of allStatuses" [value]="s">{{ s }}</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ApplicationsComponent implements OnInit {
  applications: any[] = [];
  filteredApps: any[] = [];
  jobs: any[] = [];
  loading = true;
  search = '';
  selectedJob = '';
  viewMode: 'kanban' | 'list' = 'kanban';

  allStatuses = ['Applied', 'Screening', 'Interview', 'Technical', 'HR Round', 'Offered', 'Hired', 'Rejected'];

  stages = [
    { key: 'Applied', label: 'Applied', badgeClass: 'badge badge-slate' },
    { key: 'Screening', label: 'Screening', badgeClass: 'badge badge-blue' },
    { key: 'Interview', label: 'Interview', badgeClass: 'badge badge-purple' },
    { key: 'Technical', label: 'Technical', badgeClass: 'badge badge-yellow' },
    { key: 'HR Round', label: 'HR Round', badgeClass: 'badge badge-yellow' },
    { key: 'Offered', label: 'Offered', badgeClass: 'badge badge-green' },
    { key: 'Hired', label: 'Hired', badgeClass: 'badge badge-green' },
    { key: 'Rejected', label: 'Rejected', badgeClass: 'badge badge-red' },
  ];

  constructor(
    private appService: ApplicationService,
    private jobService: JobService,
  ) {}

  ngOnInit() {
    this.loadApplications();
    this.jobService.getJobs().subscribe({ next: j => this.jobs = j, error: () => {} });
  }

  loadApplications() {
    this.appService.getApplications().subscribe({
      next: apps => { this.applications = apps; this.filteredApps = apps; this.loading = false; },
      error: () => { this.applications = this.getMockApps(); this.filteredApps = this.applications; this.loading = false; }
    });
  }

  filterApps() {
    this.filteredApps = this.applications.filter(a => {
      const matchS = !this.search || (a.candidateId?.name || '').toLowerCase().includes(this.search.toLowerCase());
      const matchJ = !this.selectedJob || (a.jobId?._id || a.jobId) === this.selectedJob;
      return matchS && matchJ;
    });
  }

  getByStage(stage: string): any[] {
    return this.filteredApps.filter(a => a.status === stage);
  }

  getNextStages(current: string): { key: string; label: string }[] {
    const idx = this.allStatuses.indexOf(current);
    const next = idx < this.allStatuses.length - 2 ? [{ key: this.allStatuses[idx + 1], label: '→ Move' }] : [];
    return [...next, { key: 'Rejected', label: '✕ Reject' }];
  }

  moveStage(app: any, status: string) {
    this.appService.updateStatus(app._id, status).subscribe({
      next: () => { app.status = status; },
      error: () => { app.status = status; } // Optimistic update
    });
  }

  getStatusBadge(s: string): string {
    const m: any = { Applied: 'badge badge-slate', Screening: 'badge badge-blue', Interview: 'badge badge-purple', Technical: 'badge badge-yellow', 'HR Round': 'badge badge-yellow', Offered: 'badge badge-green', Hired: 'badge badge-green', Rejected: 'badge badge-red' };
    return m[s] || 'badge badge-slate';
  }

  getScoreColor(s: number): string { return s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-amber-400' : 'text-red-400'; }
  getScoreGrad(s: number): string { return s >= 80 ? 'linear-gradient(90deg, #10b981, #34d399)' : s >= 60 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #ef4444, #f87171)'; }

  getMockApps() {
    return [
      { _id: '1', candidateId: { name: 'Alex Johnson', email: 'alex@ex.com', aiScore: 94 }, jobId: { title: 'Senior Frontend Developer' }, status: 'Interview', appliedDate: new Date(Date.now() - 86400000 * 5) },
      { _id: '2', candidateId: { name: 'Maria Garcia', email: 'maria@ex.com', aiScore: 88 }, jobId: { title: 'Full Stack Engineer' }, status: 'Screening', appliedDate: new Date(Date.now() - 86400000 * 3) },
      { _id: '3', candidateId: { name: 'James Wilson', email: 'james@ex.com', aiScore: 91 }, jobId: { title: 'AI/ML Engineer' }, status: 'Applied', appliedDate: new Date(Date.now() - 86400000) },
      { _id: '4', candidateId: { name: 'Sophie Chen', email: 'sophie@ex.com', aiScore: 72 }, jobId: { title: 'Product Designer' }, status: 'Offered', appliedDate: new Date(Date.now() - 86400000 * 10) },
      { _id: '5', candidateId: { name: 'David Kim', email: 'david@ex.com', aiScore: 85 }, jobId: { title: 'DevOps Engineer' }, status: 'Technical', appliedDate: new Date(Date.now() - 86400000 * 7) },
      { _id: '6', candidateId: { name: 'Emma Brown', email: 'emma@ex.com', aiScore: 89 }, jobId: { title: 'Full Stack Engineer' }, status: 'Hired', appliedDate: new Date(Date.now() - 86400000 * 20) },
      { _id: '7', candidateId: { name: 'Noah Davis', email: 'noah@ex.com', aiScore: 45 }, jobId: { title: 'Senior Frontend Developer' }, status: 'Rejected', appliedDate: new Date(Date.now() - 86400000 * 4) },
    ];
  }
}
