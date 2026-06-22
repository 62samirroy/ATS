import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidateService } from '../../services/candidate.service';
import { RouterModule } from '@angular/router';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-candidates-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="animate-fade-in">
      <div class="page-header" style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <h1 class="page-title">Candidates Dashboard</h1>
          <p class="page-subtitle">Candidate acquisition and pipeline metrics</p>
        </div>
        <a routerLink="/candidates" class="btn-primary" style="display:inline-flex;align-items:center;gap:6px">
          <i class="fa-solid fa-list"></i> View All Candidates
        </a>
      </div>

      <div *ngIf="loading" style="padding:1.5rem">
        <div class="skeleton" style="height:100px;margin-bottom:1rem"></div>
        <div class="skeleton" style="height:300px"></div>
      </div>

      <div *ngIf="!loading" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:1.5rem">
        <div class="stat-card" style="padding:1.5rem">
          <div style="display:flex;align-items:center;gap:1rem">
            <div style="width:48px;height:48px;background:#EEF6FF;border-radius:12px;display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-users" style="color:#1976D2;font-size:1.25rem"></i></div>
            <div>
              <div style="font-size:0.75rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Total Candidates</div>
              <div style="font-size:1.75rem;font-weight:800;color:var(--text)">{{ analytics?.total || 0 }}</div>
            </div>
          </div>
        </div>
        
        <div class="stat-card" style="padding:1.5rem">
          <div style="display:flex;align-items:center;gap:1rem">
            <div style="width:48px;height:48px;background:#F5F3FF;border-radius:12px;display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-microchip" style="color:#7C3AED;font-size:1.25rem"></i></div>
            <div>
              <div style="font-size:0.75rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.05em">AI Ranked</div>
              <div style="font-size:1.75rem;font-weight:800;color:#7C3AED">{{ analytics?.ranked || 0 }}</div>
            </div>
          </div>
        </div>

        <div class="stat-card" style="padding:1.5rem">
          <div style="display:flex;align-items:center;gap:1rem">
            <div style="width:48px;height:48px;background:#ECFDF5;border-radius:12px;display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-user-plus" style="color:#10B981;font-size:1.25rem"></i></div>
            <div>
              <div style="font-size:0.75rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Direct Applied</div>
              <div style="font-size:1.75rem;font-weight:800;color:#10B981">{{ analytics?.direct || 0 }}</div>
            </div>
          </div>
        </div>

        <div class="stat-card" style="padding:1.5rem">
          <div style="display:flex;align-items:center;gap:1rem">
            <div style="width:48px;height:48px;background:#FFFBEB;border-radius:12px;display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-share-nodes" style="color:#D97706;font-size:1.25rem"></i></div>
            <div>
              <div style="font-size:0.75rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Referrals</div>
              <div style="font-size:1.75rem;font-weight:800;color:#D97706">{{ analytics?.referral || 0 }}</div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <h3 class="font-bold text-lg mb-4 text-brand-text">Sourcing Channels</h3>
          <div style="position:relative;height:300px;width:100%;display:flex;justify-content:center">
            <canvas id="sourcingChart"></canvas>
          </div>
        </div>
        <div class="card">
          <h3 class="font-bold text-lg mb-4 text-brand-text">AI Score Distribution</h3>
          <div style="position:relative;height:300px;width:100%">
            <canvas id="scoreChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CandidatesDashboardComponent implements OnInit {
  analytics: any = null;
  loading = true;

  sourcingData: any[] = [];
  scoreData: any[] = [];

  get maxScore() {
    return Math.max(...this.scoreData.map(d => d.value)) || 100;
  }

  constructor(private candidateService: CandidateService) {}

  ngOnInit() {
    this.candidateService.getCandidateAnalytics().subscribe({
      next: (data) => {
        this.analytics = data;
        
        // Map sourcing data
        const sourcingColors = ['#0077B5', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#14B8A6', '#6366F1'];
        this.sourcingData = (data.sourcingData || []).map((d: any, i: number) => ({
          name: d.name,
          value: d.value,
          color: sourcingColors[i % sourcingColors.length]
        }));

        // Map score data
        const scoreColors = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#059669'];
        this.scoreData = (data.scoreData || []).map((d: any, i: number) => ({
          label: d.label,
          value: d.value,
          color: scoreColors[i]
        }));

        this.loading = false;
        setTimeout(() => this.initCharts(), 0);
      },
      error: () => {
        this.analytics = { total: 120, ranked: 85, direct: 90, referral: 30 };
        this.sourcingData = [
          { name: 'LinkedIn', value: 45, color: '#0077B5' },
          { name: 'Indeed', value: 25, color: '#3B82F6' },
          { name: 'Employee Referral', value: 20, color: '#10B981' },
          { name: 'Career Site', value: 10, color: '#8B5CF6' }
        ];
        this.scoreData = [
          { label: '< 60', value: 12, color: '#EF4444' },
          { label: '60-69', value: 25, color: '#F59E0B' },
          { label: '70-79', value: 45, color: '#3B82F6' },
          { label: '80-89', value: 30, color: '#10B981' },
          { label: '90+', value: 18, color: '#059669' }
        ];
        this.loading = false;
        setTimeout(() => this.initCharts(), 0);
      }
    });
  }

  initCharts() {
    this.initSourcingChart();
    this.initScoreChart();
  }

  initSourcingChart() {
    const ctx = document.getElementById('sourcingChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.sourcingData.map(d => d.name),
        datasets: [{
          data: this.sourcingData.map(d => d.value),
          backgroundColor: this.sourcingData.map(d => d.color),
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  initScoreChart() {
    const ctx = document.getElementById('scoreChart') as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.scoreData.map(d => d.label),
        datasets: [{
          label: 'Candidates',
          data: this.scoreData.map(d => d.value),
          backgroundColor: this.scoreData.map(d => d.color),
          borderRadius: 6
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
}
