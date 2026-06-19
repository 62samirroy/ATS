import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">Reports & Analytics</h1>
          <p class="page-subtitle">Insights into your hiring performance</p>
        </div>
        <button (click)="exportCSV()" id="btn-export" class="btn-secondary">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          Export CSV
        </button>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div *ngFor="let kpi of kpis" class="stat-card">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400 uppercase tracking-wider font-medium">{{ kpi.label }}</span>
            <span class="text-xl">{{ kpi.icon }}</span>
          </div>
          <div class="text-2xl font-bold" [class]="kpi.color">{{ kpi.value }}</div>
          <div class="text-xs text-slate-500">{{ kpi.sub }}</div>
        </div>
      </div>

      <!-- Hiring Funnel -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <h3 class="font-semibold text-white mb-5">Hiring Funnel</h3>
          <div class="space-y-4">
            <div *ngFor="let stage of funnelData" class="space-y-1">
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-300">{{ stage.label }}</span>
                <span class="font-semibold text-white">{{ stage.count }} <span class="text-slate-500 font-normal text-xs">({{ stage.pct }}%)</span></span>
              </div>
              <div class="ai-score-bar">
                <div class="ai-score-fill transition-all duration-700" [style.width]="stage.pct + '%'" [style.background]="stage.color"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="font-semibold text-white mb-5">Applications by Month</h3>
          <div class="flex items-end gap-2 h-48">
            <div *ngFor="let m of monthlyData" class="flex flex-col items-center gap-1 flex-1">
              <span class="text-xs text-slate-400">{{ m.count }}</span>
              <div class="w-full rounded-t-md bg-gradient-to-t from-primary-600 to-primary-400 transition-all duration-700" [style.height.%]="(m.count / maxMonthly) * 100" style="min-height: 4px"></div>
              <span class="text-xs text-slate-500">{{ m.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recruiter Performance -->
      <div class="card">
        <h3 class="font-semibold text-white mb-4">Recruiter Performance</h3>
        <div class="table-container">
          <table class="table">
            <thead><tr><th>#</th><th>Recruiter</th><th>Jobs Created</th><th>Candidates Reviewed</th><th>Hires</th><th>Conversion Rate</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of recruiterData; let i = index">
                <td class="text-slate-500 text-sm">{{ i + 1 }}</td>
                <td>
                  <div class="flex items-center gap-2">
                    <div class="avatar w-8 h-8 text-xs flex items-center justify-center">{{ r.name.charAt(0) }}</div>
                    <span class="text-sm font-medium text-white">{{ r.name }}</span>
                  </div>
                </td>
                <td class="text-sm text-slate-300">{{ r.jobsCreated }}</td>
                <td class="text-sm text-slate-300">{{ r.candidatesReviewed }}</td>
                <td><span class="text-sm font-semibold text-emerald-400">{{ r.hires }}</span></td>
                <td>
                  <div class="flex items-center gap-2">
                    <div class="w-16 ai-score-bar"><div class="ai-score-fill bg-emerald-500" [style.width]="r.rate + '%'"></div></div>
                    <span class="text-sm font-semibold text-white">{{ r.rate }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- AI Match Distribution -->
      <div class="card">
        <h3 class="font-semibold text-white mb-4">AI Match Score Distribution</h3>
        <div class="grid grid-cols-3 gap-4">
          <div *ngFor="let dist of matchDistribution" class="p-4 rounded-xl border text-center" [class]="dist.bg">
            <div class="text-3xl font-black mb-1" [class]="dist.color">{{ dist.count }}</div>
            <div class="text-sm font-semibold" [class]="dist.color">{{ dist.label }}</div>
            <div class="text-xs text-slate-500 mt-1">{{ dist.range }}</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  kpis = [
    { label: 'Time to Hire', value: '18 days', icon: '⏱', color: 'text-blue-400', sub: 'Avg. this month' },
    { label: 'Offer Accept Rate', value: '78%', icon: '✅', color: 'text-emerald-400', sub: '+5% vs last month' },
    { label: 'Pipeline Velocity', value: '4.2 days', icon: '⚡', color: 'text-amber-400', sub: 'Avg. per stage' },
    { label: 'Cost per Hire', value: '$2,400', icon: '💰', color: 'text-primary-400', sub: '-12% vs last month' },
  ];

  funnelData = [
    { label: 'Applications Received', count: 189, pct: 100, color: '#6366f1' },
    { label: 'Phone Screening', count: 112, pct: 59, color: '#8b5cf6' },
    { label: 'Technical Interview', count: 67, pct: 35, color: '#f59e0b' },
    { label: 'HR Round', count: 34, pct: 18, color: '#10b981' },
    { label: 'Offer Extended', count: 15, pct: 8, color: '#22c55e' },
    { label: 'Hired', count: 8, pct: 4, color: '#16a34a' },
  ];

  monthlyData = [
    { label: 'Jan', count: 23 }, { label: 'Feb', count: 31 }, { label: 'Mar', count: 28 },
    { label: 'Apr', count: 45 }, { label: 'May', count: 52 }, { label: 'Jun', count: 38 },
    { label: 'Jul', count: 61 }, { label: 'Aug', count: 55 }, { label: 'Sep', count: 42 },
    { label: 'Oct', count: 67 }, { label: 'Nov', count: 58 }, { label: 'Dec', count: 48 },
  ];

  get maxMonthly(): number { return Math.max(...this.monthlyData.map(m => m.count)); }

  recruiterData = [
    { name: 'Sarah Mitchell', jobsCreated: 8, candidatesReviewed: 74, hires: 6, rate: 81 },
    { name: 'John Patel', jobsCreated: 6, candidatesReviewed: 58, hires: 4, rate: 67 },
    { name: 'Lisa Chen', jobsCreated: 5, candidatesReviewed: 43, hires: 3, rate: 60 },
    { name: 'Mark Johnson', jobsCreated: 4, candidatesReviewed: 31, hires: 2, rate: 50 },
  ];

  matchDistribution = [
    { label: 'High Match', range: '80–100%', count: 67, color: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/20' },
    { label: 'Medium Match', range: '60–79%', count: 89, color: 'text-amber-400', bg: 'bg-amber-500/5 border-amber-500/20' },
    { label: 'Low Match', range: '0–59%', count: 33, color: 'text-red-400', bg: 'bg-red-500/5 border-red-500/20' },
  ];

  constructor(private reportService: ReportService) {}

  ngOnInit() {
    this.reportService.getDashboardStats().subscribe({ next: () => {}, error: () => {} });
  }

  exportCSV() {
    const rows = [['Candidate', 'Job', 'Status', 'AI Score', 'Applied Date']];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'hireflow-report.csv'; a.click();
    URL.revokeObjectURL(url);
  }
}
