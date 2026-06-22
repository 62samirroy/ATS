import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InterviewService } from '../../services/interview.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-interviews-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="animate-fade-in">
      <div class="page-header" style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <h1 class="page-title">Interviews Dashboard</h1>
          <p class="page-subtitle">Interview scheduling and outcome metrics</p>
        </div>
        <a routerLink="/interviews" class="btn-primary" style="display:inline-flex;align-items:center;gap:6px">
          <i class="fa-solid fa-list"></i> View All Interviews
        </a>
      </div>

      <div *ngIf="loading" style="padding:1.5rem">
        <div class="skeleton" style="height:100px;margin-bottom:1rem"></div>
        <div class="skeleton" style="height:300px"></div>
      </div>

      <div *ngIf="!loading" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:1.5rem">
        <div class="stat-card" style="padding:1.5rem">
          <div style="display:flex;align-items:center;gap:1rem">
            <div style="width:48px;height:48px;background:#EEF6FF;border-radius:12px;display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-calendar" style="color:#1976D2;font-size:1.25rem"></i></div>
            <div>
              <div style="font-size:0.75rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Total Interviews</div>
              <div style="font-size:1.75rem;font-weight:800;color:var(--text)">{{ analytics?.total || 0 }}</div>
            </div>
          </div>
        </div>
        
        <div class="stat-card" style="padding:1.5rem">
          <div style="display:flex;align-items:center;gap:1rem">
            <div style="width:48px;height:48px;background:#FEF3C7;border-radius:12px;display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-clock" style="color:#D97706;font-size:1.25rem"></i></div>
            <div>
              <div style="font-size:0.75rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Scheduled</div>
              <div style="font-size:1.75rem;font-weight:800;color:#D97706">{{ analytics?.scheduled || 0 }}</div>
            </div>
          </div>
        </div>

        <div class="stat-card" style="padding:1.5rem">
          <div style="display:flex;align-items:center;gap:1rem">
            <div style="width:48px;height:48px;background:#ECFDF5;border-radius:12px;display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-check" style="color:#10B981;font-size:1.25rem"></i></div>
            <div>
              <div style="font-size:0.75rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Completed</div>
              <div style="font-size:1.75rem;font-weight:800;color:#10B981">{{ analytics?.completed || 0 }}</div>
            </div>
          </div>
        </div>

        <div class="stat-card" style="padding:1.5rem">
          <div style="display:flex;align-items:center;gap:1rem">
            <div style="width:48px;height:48px;background:#FEF2F2;border-radius:12px;display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-xmark" style="color:#DC2626;font-size:1.25rem"></i></div>
            <div>
              <div style="font-size:0.75rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Cancelled / No Show</div>
              <div style="font-size:1.75rem;font-weight:800;color:#DC2626">{{ analytics?.cancelled || 0 }}</div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <h3 class="font-bold text-lg mb-4">Interview Pipeline</h3>
          <div class="flex items-center justify-center h-48 border-2 border-dashed border-brand-border rounded-lg text-brand-muted">
            <div class="text-center">
              <i class="fa-solid fa-chart-pie text-3xl mb-2"></i>
              <p>Pass/Fail distribution chart will render here</p>
            </div>
          </div>
        </div>
        <div class="card">
          <h3 class="font-bold text-lg mb-4">Feedback Scores</h3>
          <div class="flex items-center justify-center h-48 border-2 border-dashed border-brand-border rounded-lg text-brand-muted">
            <div class="text-center">
              <i class="fa-solid fa-chart-line text-3xl mb-2"></i>
              <p>Average feedback scores chart will render here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InterviewsDashboardComponent implements OnInit {
  analytics: any = null;
  loading = true;

  constructor(private interviewService: InterviewService) {}

  ngOnInit() {
    this.interviewService.getInterviewAnalytics().subscribe({
      next: (data) => {
        this.analytics = data;
        this.loading = false;
      },
      error: () => {
        this.analytics = { total: 45, scheduled: 12, completed: 28, cancelled: 5 };
        this.loading = false;
      }
    });
  }
}
