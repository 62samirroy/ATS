import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">Reports & Analytics</h1>
          <p class="page-subtitle">Insights into your hiring performance</p>
        </div>
        <button (click)="exportCSV()" class="btn-secondary">
          <i class="fa-solid fa-download" style="font-size:0.75rem"></i> Export CSV
        </button>
      </div>

      <!-- KPI Cards — compact, same as stat-card pattern -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:0.75rem;margin-bottom:1rem">
        <div *ngFor="let kpi of kpis" class="stat-card" style="padding:0.75rem 0.875rem">
          <div style="display:flex;align-items:center;gap:0.5rem">
            <div [style.background]="kpi.bgHex" style="width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <span style="font-size:1rem">{{ kpi.icon }}</span>
            </div>
            <div>
              <div style="font-size:0.6rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.04em;line-height:1.2">{{ kpi.label }}</div>
              <div style="font-size:1.125rem;font-weight:800;color:var(--text);line-height:1.1">{{ kpi.value }}</div>
              <div style="font-size:0.625rem;font-weight:600" [style.color]="kpi.colorHex">{{ kpi.sub }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Funnel + Chart (same row) -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.75rem">

        <!-- Hiring Funnel -->
        <div class="card" style="padding:1rem">
          <div style="font-size:0.875rem;font-weight:700;color:var(--text);margin-bottom:1rem">Hiring Funnel</div>
          <div style="display:flex;flex-direction:column;gap:0.625rem">
            <div *ngFor="let stage of funnelData">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px">
                <span style="font-size:0.75rem;color:var(--muted)">{{ stage.label }}</span>
                <span style="font-size:0.75rem;font-weight:700;color:var(--text)">{{ stage.count }} <span style="font-size:0.625rem;color:var(--muted);font-weight:400">({{ stage.pct }}%)</span></span>
              </div>
              <div class="ai-score-bar" style="height:5px;background:#EEF2F7">
                <div class="ai-score-fill" [style.width]="stage.pct+'%'" [style.background]="stage.color"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Monthly Bar Chart -->
        <div class="card" style="padding:1rem">
          <div style="font-size:0.875rem;font-weight:700;color:var(--text);margin-bottom:1rem">Applications by Month</div>
          <div style="display:flex;align-items:flex-end;gap:4px;height:160px">
            <div *ngFor="let m of monthlyData" style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px">
              <span style="font-size:0.5625rem;color:var(--muted);font-weight:600">{{ m.count }}</span>
              <div style="width:100%;border-radius:3px 3px 0 0;background:var(--primary);min-height:4px;transition:height 0.5s;opacity:0.85" [style.height.%]="(m.count/maxMonthly)*100"></div>
              <span style="font-size:0.5625rem;color:var(--muted)">{{ m.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recruiter Table + AI Distribution -->
      <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:0.75rem">

        <!-- Recruiter Performance Table -->
        <div class="card" style="padding:0;overflow:hidden">
          <div style="padding:0.75rem 1rem;border-bottom:1px solid var(--border)">
            <div style="font-size:0.875rem;font-weight:700;color:var(--text)">Recruiter Performance</div>
          </div>
          <table class="table" style="margin:0">
            <thead>
              <tr>
                <th style="width:30px">#</th>
                <th>Recruiter</th>
                <th style="text-align:center">Jobs</th>
                <th style="text-align:center">Hires</th>
                <th>Conversion</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of recruiterData; let i=index">
                <td style="font-size:0.6875rem;color:var(--muted);font-weight:600">{{ i+1 }}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:0.5rem">
                    <div class="avatar" style="width:26px;height:26px;font-size:0.6875rem;flex-shrink:0">{{ r.name.charAt(0) }}</div>
                    <span style="font-size:0.8125rem;font-weight:600;color:var(--text)">{{ r.name }}</span>
                  </div>
                </td>
                <td style="font-size:0.8125rem;color:var(--text);text-align:center">{{ r.jobsCreated }}</td>
                <td style="font-size:0.8125rem;font-weight:700;color:#16A34A;text-align:center">{{ r.hires }}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:0.5rem">
                    <div class="ai-score-bar" style="width:48px;background:#EEF2F7">
                      <div class="ai-score-fill" style="background:#16A34A" [style.width]="r.rate+'%'"></div>
                    </div>
                    <span style="font-size:0.75rem;font-weight:700;color:var(--text)">{{ r.rate }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- AI Match Distribution -->
        <div class="card" style="padding:1rem">
          <div style="font-size:0.875rem;font-weight:700;color:var(--text);margin-bottom:1rem">AI Match Distribution</div>
          <div style="display:flex;flex-direction:column;gap:0.625rem">
            <div *ngFor="let d of matchDistribution" style="padding:0.75rem;border-radius:8px;border:1px solid;display:flex;align-items:center;justify-content:space-between" [style.background]="d.bgHex" [style.border-color]="d.borderHex">
              <div>
                <div style="font-size:0.8125rem;font-weight:700;margin-bottom:1px" [style.color]="d.colorHex">{{ d.label }}</div>
                <div style="font-size:0.625rem;color:var(--muted)">{{ d.range }}</div>
              </div>
              <div style="font-size:1.5rem;font-weight:900" [style.color]="d.colorHex">{{ d.count }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  kpis = [
    { label:'Time to Hire',      value:'18 days',  icon:'⏱', colorHex:'#1976D2', bgHex:'#EEF6FF', sub:'Avg. this month' },
    { label:'Offer Accept Rate', value:'78%',      icon:'✅', colorHex:'#16A34A', bgHex:'#F0FDF4', sub:'+5% vs last month' },
    { label:'Pipeline Velocity', value:'4.2 days', icon:'⚡', colorHex:'#D97706', bgHex:'#FFFBEB', sub:'Avg. per stage' },
    { label:'Cost per Hire',     value:'$2,400',   icon:'💰', colorHex:'#7C3AED', bgHex:'#F5F3FF', sub:'-12% vs last month' },
  ];

  funnelData = [
    { label:'Applications Received', count:189, pct:100, color:'#1976D2' },
    { label:'Phone Screening',        count:112, pct:59,  color:'#7C3AED' },
    { label:'Technical Interview',    count:67,  pct:35,  color:'#D97706' },
    { label:'HR Round',               count:34,  pct:18,  color:'#10b981' },
    { label:'Offer Extended',         count:15,  pct:8,   color:'#22c55e' },
    { label:'Hired',                  count:8,   pct:4,   color:'#16a34a' },
  ];

  monthlyData = [
    {label:'J',count:23},{label:'F',count:31},{label:'M',count:28},{label:'A',count:45},
    {label:'M',count:52},{label:'J',count:38},{label:'J',count:61},{label:'A',count:55},
    {label:'S',count:42},{label:'O',count:67},{label:'N',count:58},{label:'D',count:48},
  ];

  get maxMonthly() { return Math.max(...this.monthlyData.map(m=>m.count)); }

  recruiterData = [
    { name:'Sarah Mitchell', jobsCreated:8, hires:6, rate:81 },
    { name:'John Patel',     jobsCreated:6, hires:4, rate:67 },
    { name:'Lisa Chen',      jobsCreated:5, hires:3, rate:60 },
    { name:'Mark Johnson',   jobsCreated:4, hires:2, rate:50 },
  ];

  matchDistribution = [
    { label:'High Match',   range:'80–100%', count:67, colorHex:'#16A34A', bgHex:'#F0FDF4', borderHex:'rgba(22,163,74,0.2)' },
    { label:'Medium Match', range:'60–79%',  count:89, colorHex:'#D97706', bgHex:'#FFFBEB', borderHex:'rgba(217,119,6,0.2)' },
    { label:'Low Match',    range:'0–59%',   count:33, colorHex:'#DC2626', bgHex:'#FEF2F2', borderHex:'rgba(220,38,38,0.2)' },
  ];

  constructor(private reportService: ReportService) {}
  ngOnInit() { this.reportService.getDashboardStats().subscribe({ next:()=>{}, error:()=>{} }); }

  exportCSV() {
    const csv = 'Candidate,Job,Status,AI Score,Applied Date\n';
    const blob = new Blob([csv], { type:'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href=url; a.download='hireflow-report.csv'; a.click();
    URL.revokeObjectURL(url);
  }
}
