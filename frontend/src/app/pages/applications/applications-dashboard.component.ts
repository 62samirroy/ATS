import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationService } from '../../services/application.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-applications-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="animate-fade-in">
      <div class="page-header" style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <h1 class="page-title">Applications Dashboard</h1>
          <p class="page-subtitle">Candidate funnel and conversion metrics</p>
        </div>
        <a routerLink="/applications" class="btn-primary" style="display:inline-flex;align-items:center;gap:6px">
          <i class="fa-solid fa-list"></i> View All Applications
        </a>
      </div>

      <div *ngIf="loading" style="padding:1.5rem">
        <div class="skeleton" style="height:100px;margin-bottom:1rem"></div>
        <div class="skeleton" style="height:300px"></div>
      </div>

      <div *ngIf="!loading" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:1.5rem">
        <div class="stat-card" style="padding:1.5rem">
          <div style="display:flex;align-items:center;gap:1rem">
            <div style="width:48px;height:48px;background:#EEF6FF;border-radius:12px;display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-file-lines" style="color:#1976D2;font-size:1.25rem"></i></div>
            <div>
              <div style="font-size:0.75rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Total Applications</div>
              <div style="font-size:1.75rem;font-weight:800;color:var(--text)">{{ analytics?.total || 0 }}</div>
            </div>
          </div>
        </div>
        
        <div class="stat-card" style="padding:1.5rem">
          <div style="display:flex;align-items:center;gap:1rem">
            <div style="width:48px;height:48px;background:#FEF3C7;border-radius:12px;display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-spinner" style="color:#D97706;font-size:1.25rem"></i></div>
            <div>
              <div style="font-size:0.75rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.05em">In Progress</div>
              <div style="font-size:1.75rem;font-weight:800;color:#D97706">{{ getInProgressCount() }}</div>
            </div>
          </div>
        </div>

        <div class="stat-card" style="padding:1.5rem">
          <div style="display:flex;align-items:center;gap:1rem">
            <div style="width:48px;height:48px;background:#ECFDF5;border-radius:12px;display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-handshake" style="color:#10B981;font-size:1.25rem"></i></div>
            <div>
              <div style="font-size:0.75rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Hired</div>
              <div style="font-size:1.75rem;font-weight:800;color:#10B981">{{ getCountByStatus('Hired') }}</div>
            </div>
          </div>
        </div>

        <div class="stat-card" style="padding:1.5rem">
          <div style="display:flex;align-items:center;gap:1rem">
            <div style="width:48px;height:48px;background:#FEF2F2;border-radius:12px;display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-ban" style="color:#DC2626;font-size:1.25rem"></i></div>
            <div>
              <div style="font-size:0.75rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Rejected</div>
              <div style="font-size:1.75rem;font-weight:800;color:#DC2626">{{ getCountByStatus('Rejected') }}</div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <h3 class="font-bold text-lg mb-4">Application Funnel</h3>
          <div class="flex items-center justify-center h-48 border-2 border-dashed border-brand-border rounded-lg text-brand-muted">
            <div class="text-center">
              <i class="fa-solid fa-filter text-3xl mb-2"></i>
              <p>Funnel chart will render here</p>
            </div>
          </div>
        </div>
        <div class="card">
          <h3 class="font-bold text-lg mb-4">Applications by Month</h3>
          <div class="flex items-center justify-center h-48 border-2 border-dashed border-brand-border rounded-lg text-brand-muted">
            <div class="text-center">
              <i class="fa-solid fa-chart-area text-3xl mb-2"></i>
              <p>Time series chart will render here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ApplicationsDashboardComponent implements OnInit {
  analytics: any = null;
  loading = true;

  constructor(private applicationService: ApplicationService) {}

  ngOnInit() {
    this.applicationService.getAnalytics().subscribe({
      next: (data) => {
        this.analytics = data;
        this.loading = false;
      },
      error: () => {
        this.analytics = { total: 0, byStatus: [], byMonth: [] };
        this.loading = false;
      }
    });
  }

  getCountByStatus(status: string): number {
    if (!this.analytics || !this.analytics.byStatus) return 0;
    const s = this.analytics.byStatus.find((item: any) => item._id === status);
    return s ? s.count : 0;
  }

  getInProgressCount(): number {
    if (!this.analytics || !this.analytics.byStatus) return 0;
    return this.analytics.byStatus
      .filter((item: any) => item._id !== 'Hired' && item._id !== 'Rejected')
      .reduce((sum: number, item: any) => sum + item.count, 0);
  }
}
