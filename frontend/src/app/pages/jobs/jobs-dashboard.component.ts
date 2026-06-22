import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JobService } from '../../services/job.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-jobs-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">Jobs Dashboard</h1>
          <p class="page-subtitle">Overview of your recruitment funnel and job postings</p>
        </div>
      </div>

      <!-- Stat Cards -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:1.5rem">
        <div class="stat-card">
          <div style="display:flex;align-items:center;gap:0.75rem">
            <div style="width:42px;height:42px;background:#EEF6FF;border-radius:10px;display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-briefcase" style="color:#1976D2;font-size:1.1rem"></i></div>
            <div>
              <div style="font-size:0.75rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.04em">Total Jobs</div>
              <div style="font-size:1.5rem;font-weight:800;color:var(--text);line-height:1.2">{{ stats?.total || 0 }}</div>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div style="display:flex;align-items:center;gap:0.75rem">
            <div style="width:42px;height:42px;background:#F0FDF4;border-radius:10px;display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-circle-check" style="color:#16A34A;font-size:1.1rem"></i></div>
            <div>
              <div style="font-size:0.75rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.04em">Published</div>
              <div style="font-size:1.5rem;font-weight:800;color:#16A34A;line-height:1.2">{{ stats?.published || 0 }}</div>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div style="display:flex;align-items:center;gap:0.75rem">
            <div style="width:42px;height:42px;background:#FFFBEB;border-radius:10px;display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-file-pen" style="color:#D97706;font-size:1.1rem"></i></div>
            <div>
              <div style="font-size:0.75rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.04em">Drafts</div>
              <div style="font-size:1.5rem;font-weight:800;color:#D97706;line-height:1.2">{{ stats?.draft || 0 }}</div>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div style="display:flex;align-items:center;gap:0.75rem">
            <div style="width:42px;height:42px;background:#FEF2F2;border-radius:10px;display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-lock" style="color:#DC2626;font-size:1.1rem"></i></div>
            <div>
              <div style="font-size:0.75rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.04em">Closed</div>
              <div style="font-size:1.5rem;font-weight:800;color:#DC2626;line-height:1.2">{{ stats?.closed || 0 }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Section: Charts -->
      <div *ngIf="!loading" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(400px,1fr));gap:1.5rem">
        
        <!-- Chart 1: Pipeline Analytics -->
        <div class="card" style="padding:1.5rem">
          <h3 class="font-bold text-brand-text mb-4">Recruitment Pipeline</h3>
          <div style="position:relative;height:300px;width:100%">
            <canvas id="pipelineChart"></canvas>
          </div>
        </div>

        <!-- Chart 2: Jobs by Status -->
        <div class="card" style="padding:1.5rem">
          <h3 class="font-bold text-brand-text mb-4">Jobs by Status</h3>
          <div style="position:relative;height:300px;width:100%;display:flex;justify-content:center">
            <canvas id="statusChart"></canvas>
          </div>
        </div>

        <!-- Chart 3: Jobs by Type -->
        <div class="card" style="padding:1.5rem">
          <h3 class="font-bold text-brand-text mb-4">Jobs by Type</h3>
          <div style="position:relative;height:300px;width:100%">
            <canvas id="typeChart"></canvas>
          </div>
        </div>

      </div>

      <div *ngIf="loading" class="card p-6 min-h-[300px] flex items-center justify-center border-dashed">
        <div class="text-center">
          <i class="fa-solid fa-spinner fa-spin text-brand-primary text-3xl mb-4"></i>
          <p class="text-brand-muted">Loading analytics...</p>
        </div>
      </div>
    </div>
  `
})
export class JobsDashboardComponent implements OnInit {
  stats: any = { total: 0, published: 0, draft: 0, closed: 0 };
  loading = true;

  jobsList: any[] = [];

  constructor(private jobService: JobService) {}

  ngOnInit() {
    this.jobService.getJobs().subscribe({
      next: (jobs) => {
        this.jobsList = jobs;
        this.stats.total = jobs.length;
        this.stats.published = jobs.filter(j => j.status === 'Published').length;
        this.stats.draft = jobs.filter(j => j.status === 'Draft').length;
        this.stats.closed = jobs.filter(j => j.status === 'Closed').length;
        this.loading = false;
        setTimeout(() => this.initCharts(), 0);
      },
      error: () => {
        // mock fallback
        this.jobsList = [];
        this.stats = { total: 12, published: 8, draft: 3, closed: 1 };
        this.loading = false;
        setTimeout(() => this.initCharts(), 0);
      }
    });
  }

  initCharts() {
    this.initPipelineChart();
    this.initStatusChart();
    this.initTypeChart();
  }

  initPipelineChart() {
    const ctx = document.getElementById('pipelineChart') as HTMLCanvasElement;
    if (!ctx) return;
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Applied', 'Screening', 'Interview', 'Offered', 'Hired'],
        datasets: [{
          label: 'Candidates',
          data: [120, 85, 42, 15, 8],
          backgroundColor: 'rgba(25, 118, 210, 0.7)',
          borderColor: 'rgba(25, 118, 210, 1)',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  initStatusChart() {
    const ctx = document.getElementById('statusChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    const draft = this.stats.draft;
    const published = this.stats.published;
    const closed = this.stats.closed;

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Draft', 'Published', 'Closed'],
        datasets: [{
          data: [draft, published, closed],
          backgroundColor: ['#D97706', '#16A34A', '#DC2626'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  initTypeChart() {
    const ctx = document.getElementById('typeChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Calculate types from loaded jobs, or use mock fallback
    let typesMap: Record<string, number> = {};
    if (this.jobsList.length > 0) {
      this.jobsList.forEach(job => {
        typesMap[job.type] = (typesMap[job.type] || 0) + 1;
      });
    } else {
      typesMap = { 'Full-time': 8, 'Part-time': 2, 'Contract': 2 };
    }

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(typesMap),
        datasets: [{
          label: 'Job Types',
          data: Object.values(typesMap),
          backgroundColor: 'rgba(124, 58, 237, 0.7)',
          borderColor: 'rgba(124, 58, 237, 1)',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y', // Makes it a horizontal bar chart
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { beginAtZero: true, grid: { color: '#f1f5f9' } },
          y: { grid: { display: false } }
        }
      }
    });
  }
}
