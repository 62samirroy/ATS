import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../services/application.service';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="animate-fade-in">

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Job Applications</h1>
          <p class="page-subtitle">Manage and track all job applications</p>
        </div>
        <div style="display:flex;gap:0.5rem;align-items:center">
          <button class="btn-primary" style="gap:0.375rem">
            <i class="fa-solid fa-upload" style="font-size:0.75rem"></i> Import
          </button>
          <a routerLink="/applications/recycle-bin" class="btn-secondary" style="color:var(--danger);border-color:rgba(220,38,38,0.25);display:flex;align-items:center;gap:6px">
            <i class="fa-solid fa-trash-can" style="font-size:0.75rem"></i> Recycle Bin
          </a>
        </div>
      </div>

      <!-- Stat Cards -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:0.75rem;margin-bottom:1rem">
        <div *ngFor="let s of statCards" class="stat-card" style="padding:0.75rem 0.875rem">
          <div style="display:flex;align-items:center;gap:0.5rem">
            <div [style.background]="s.iconBg" style="width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <i [class]="s.icon" [style.color]="s.iconColor" style="font-size:0.9rem"></i>
            </div>
            <div>
              <div style="font-size:0.625rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.04em;line-height:1.2">{{ s.label }}</div>
              <div style="font-size:1.25rem;font-weight:800;color:var(--text);line-height:1.1">{{ s.value }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Card -->
      <div class="card" style="padding:0;overflow:hidden">

        <!-- Status Tabs -->
        <div class="status-tabs">
          <button *ngFor="let tab of statusTabs" class="status-tab" [class.active]="activeTab===tab.key" (click)="setTab(tab.key)">
            {{ tab.label }}
            <span class="status-tab-count">{{ getTabCount(tab.key) }}</span>
          </button>
        </div>

        <!-- Filter Bar -->
        <div class="filter-bar">
          <div class="search-wrap" style="flex:1;min-width:180px;max-width:280px">
            <svg class="search-icon-inner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" [(ngModel)]="search" (input)="applyFilter()" placeholder="Search applications...">
          </div>
          <select [(ngModel)]="selectedJob" (change)="applyFilter()" class="form-select" style="width:auto;min-width:130px">
            <option value="">All Job Titles</option>
            <option *ngFor="let j of jobs" [value]="j._id">{{ j.title }}</option>
          </select>
          <select [(ngModel)]="statusFilter" (change)="applyFilter()" class="form-select" style="width:auto;min-width:120px">
            <option value="">All Statuses</option>
            <option *ngFor="let s of allStatuses" [value]="s">{{ s }}</option>
          </select>
          <div style="display:flex;align-items:center;gap:4px;padding:0.3125rem 0.625rem;background:#fff;border:1px solid var(--border);border-radius:6px;font-size:0.75rem;color:var(--muted);white-space:nowrap;cursor:pointer">
            <i class="fa-regular fa-calendar" style="font-size:0.75rem"></i>
            <span>Date Range</span>
          </div>
          <!-- View Toggle -->
          <div style="display:flex;gap:2px;margin-left:auto">
            <button class="view-toggle-btn" [class.active]="viewMode==='list'" (click)="viewMode='list'" title="List View">
              <i class="fa-solid fa-list"></i>
            </button>
            <button class="view-toggle-btn" [class.active]="viewMode==='card'" (click)="viewMode='card'" title="Card View">
              <i class="fa-solid fa-grip"></i>
            </button>
            <button class="view-toggle-btn" [class.active]="viewMode==='kanban'" (click)="viewMode='kanban'" title="Kanban View">
              <i class="fa-solid fa-table-columns"></i>
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" style="padding:1.5rem">
          <div *ngFor="let i of [1,2,3,4,5]" class="skeleton" style="height:44px;margin-bottom:6px"></div>
        </div>

        <!-- Empty -->
        <div *ngIf="!loading && pagedApps.length===0" style="text-align:center;padding:4rem 2rem;color:var(--muted)">
          <i class="fa-solid fa-folder-open" style="font-size:2.5rem;color:var(--border);display:block;margin-bottom:1rem"></i>
          <p style="font-size:1rem;font-weight:600;color:var(--text);margin-bottom:0.25rem">No applications found</p>
          <p style="font-size:0.875rem">Try adjusting your search or filters</p>
        </div>

        <!-- ===== LIST VIEW ===== -->
        <div *ngIf="!loading && pagedApps.length>0 && viewMode==='list'" class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th style="width:36px"><input type="checkbox" style="width:14px;height:14px;accent-color:var(--primary);cursor:pointer"></th>
                <th>App ID</th>
                <th>Applicant</th>
                <th>Job Position</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Meeting</th>
                <th>Rating</th>
                <th style="width:80px;text-align:center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let app of pagedApps">
                <td><input type="checkbox" style="width:14px;height:14px;accent-color:var(--primary);cursor:pointer"></td>
                <td>
                  <div style="font-size:0.75rem;font-weight:700;color:var(--primary)">{{ app.appId }}</div>
                </td>
                <td>
                  <div style="display:flex;align-items:center;gap:0.5rem">
                    <div class="avatar" style="width:30px;height:30px;font-size:0.75rem;flex-shrink:0">{{ app.candidateId?.name?.charAt(0)||'?' }}</div>
                    <div>
                      <div style="font-weight:600;color:var(--text);font-size:0.8125rem">{{ app.candidateId?.name||'Unknown' }}</div>
                      <div style="font-size:0.6875rem;color:var(--muted)">{{ app.candidateId?.phone||app.candidateId?.email }}</div>
                    </div>
                  </div>
                </td>
                <td style="font-size:0.8125rem;color:var(--text);max-width:180px">
                  <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ app.jobId?.title||'N/A' }}</div>
                </td>
                <td style="font-size:0.75rem;color:var(--muted)">{{ app.appliedDate | date:'dd MMM yyyy' }}</td>
                <td><span [class]="getStatusBadge(app.status)">{{ app.status }}</span></td>
                <td>
                  <span *ngIf="app.meetingStatus" [class]="getMeetingBadge(app.meetingStatus)">{{ app.meetingStatus }}</span>
                  <span *ngIf="!app.meetingStatus" style="color:var(--muted)">—</span>
                </td>
                <td>
                  <div style="display:flex;gap:1px;color:#CBD5E1">
                    <i class="fa-regular fa-star" style="font-size:0.625rem"></i>
                    <i class="fa-regular fa-star" style="font-size:0.625rem"></i>
                    <i class="fa-regular fa-star" style="font-size:0.625rem"></i>
                    <i class="fa-regular fa-star" style="font-size:0.625rem"></i>
                    <i class="fa-regular fa-star" style="font-size:0.625rem"></i>
                  </div>
                </td>
                <td>
                  <div style="display:flex;align-items:center;justify-content:center;gap:4px">
                    <button (click)="openEditModal(app)" class="btn-icon btn-icon-primary" title="Edit Application">
                      <i class="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button (click)="confirmDelete(app)" class="btn-icon btn-icon-danger" title="Delete Application">
                      <i class="fa-regular fa-trash-can"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ===== CARD VIEW ===== -->
        <div *ngIf="!loading && pagedApps.length>0 && viewMode==='card'" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;padding:1rem">
          <div *ngFor="let app of pagedApps" class="data-card">
            <div style="display:flex;align-items:start;justify-content:space-between;margin-bottom:0.75rem">
              <div style="display:flex;align-items:center;gap:0.5rem">
                <div class="avatar" style="width:36px;height:36px;font-size:0.875rem">{{ app.candidateId?.name?.charAt(0)||'?' }}</div>
                <div>
                  <div style="font-weight:600;color:var(--text);font-size:0.875rem">{{ app.candidateId?.name||'Unknown' }}</div>
                  <div style="font-size:0.6875rem;color:var(--muted)">{{ app.candidateId?.phone||app.candidateId?.email }}</div>
                </div>
              </div>
              <div style="display:flex;gap:4px">
                <button (click)="openEditModal(app)" class="btn-icon btn-icon-primary btn-sm"><i class="fa-regular fa-pen-to-square"></i></button>
                <button (click)="confirmDelete(app)" class="btn-icon btn-icon-danger btn-sm"><i class="fa-regular fa-trash-can"></i></button>
              </div>
            </div>
            <div style="padding:0.5rem;background:var(--bg);border-radius:6px;margin-bottom:0.625rem">
              <div style="font-size:0.75rem;font-weight:600;color:var(--primary);margin-bottom:2px">{{ app.appId }}</div>
              <div style="font-size:0.8125rem;color:var(--text);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ app.jobId?.title||'N/A' }}</div>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;font-size:0.75rem;color:var(--muted);margin-bottom:0.625rem">
              <span><i class="fa-regular fa-calendar" style="margin-right:4px"></i>{{ app.appliedDate | date:'dd MMM yyyy' }}</span>
              <span *ngIf="app.meetingStatus"><span [class]="getMeetingBadge(app.meetingStatus)">{{ app.meetingStatus }}</span></span>
            </div>
            <div *ngIf="app.candidateId?.aiScore" style="margin-bottom:0.625rem">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <span style="font-size:0.6875rem;color:var(--muted)">AI Score</span>
                <span style="font-size:0.6875rem;font-weight:700" [style.color]="app.candidateId.aiScore>=80?'#16A34A':app.candidateId.aiScore>=60?'#D97706':'#DC2626'">{{ app.candidateId.aiScore }}%</span>
              </div>
              <div class="ai-score-bar"><div class="ai-score-fill" [style.width.%]="app.candidateId.aiScore" [style.background]="getScoreGrad(app.candidateId.aiScore)"></div></div>
            </div>
            <div style="display:flex;gap:0.375rem;padding-top:0.625rem;border-top:1px solid var(--border)">
              <button (click)="moveStage(app, getNextStatus(app.status))" *ngIf="getNextStatus(app.status)" class="btn-primary btn-sm" style="flex:1;font-size:0.6875rem">
                → {{ getNextStatus(app.status) }}
              </button>
              <button (click)="moveStage(app,'Rejected')" *ngIf="app.status!=='Rejected'" class="btn-danger btn-sm" style="font-size:0.6875rem">
                Reject
              </button>
            </div>
          </div>
        </div>

        <!-- ===== KANBAN VIEW ===== -->
        <div *ngIf="!loading && pagedApps.length>0 && viewMode==='kanban'" style="display:flex;gap:0.875rem;overflow-x:auto;padding:1rem">
          <div *ngFor="let stage of stages" class="pipeline-stage" style="flex-shrink:0;width:210px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;padding:0 2px">
              <span style="font-size:0.6875rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.06em">{{ stage.label }}</span>
              <span class="badge badge-slate" style="font-size:0.6rem">{{ getByStage(stage.key).length }}</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:0.5rem">
              <div *ngFor="let app of getByStage(stage.key)" class="pipeline-card">
                <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.375rem">
                  <div class="avatar" style="width:26px;height:26px;font-size:0.6875rem">{{ app.candidateId?.name?.charAt(0)||'?' }}</div>
                  <div style="flex:1;min-width:0;display:flex;justify-content:space-between;align-items:center">
                    <p style="font-size:0.8125rem;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:0">{{ app.candidateId?.name||'Candidate' }}</p>
                    <div style="display:flex;gap:2px">
                      <button (click)="openEditModal(app)" style="background:none;border:none;color:var(--primary);cursor:pointer"><i class="fa-solid fa-pen" style="font-size:0.6rem"></i></button>
                      <button (click)="confirmDelete(app)" style="background:none;border:none;color:var(--danger);cursor:pointer"><i class="fa-solid fa-trash" style="font-size:0.6rem"></i></button>
                    </div>
                  </div>
                </div>
                <p style="font-size:0.6875rem;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-bottom:0.375rem">{{ app.jobId?.title||'Job' }}</p>
                <div *ngIf="app.candidateId?.aiScore">
                  <div class="ai-score-bar" style="height:4px"><div class="ai-score-fill" style="height:100%" [style.width.%]="app.candidateId.aiScore" [style.background]="getScoreGrad(app.candidateId.aiScore)"></div></div>
                  <span style="font-size:0.625rem;color:var(--muted)">AI: {{ app.candidateId.aiScore }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== PAGINATION ===== -->
        <div *ngIf="!loading && filteredApps.length>0" class="pagination-bar">
          <span class="pagination-info">Showing {{ pageStart }}–{{ pageEnd }} of {{ filteredApps.length }} rows</span>
          <div style="display:flex;align-items:center;gap:0.5rem">
            <select class="page-size-select" [(ngModel)]="pageSize" (change)="onPageSizeChange()">
              <option [value]="10">10 / page</option>
              <option [value]="20">20 / page</option>
              <option [value]="50">50 / page</option>
            </select>
          </div>
          <div class="pagination-controls">
            <button class="page-btn" (click)="goToPage(currentPage-1)" [disabled]="currentPage===1">
              <i class="fa-solid fa-chevron-left" style="font-size:0.625rem"></i>&nbsp;Previous
            </button>
            <span style="font-size:0.8125rem;color:var(--muted);white-space:nowrap;padding:0 0.25rem">Page {{ currentPage }} of {{ totalPages }}</span>
            <button class="page-btn" (click)="goToPage(currentPage+1)" [disabled]="currentPage===totalPages">
              Next&nbsp;<i class="fa-solid fa-chevron-right" style="font-size:0.625rem"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div *ngIf="showEditModal" class="modal-overlay" (click)="showEditModal=false">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <h3 class="text-lg font-bold mb-4">Edit Application</h3>
        <div class="space-y-4">
          <div class="form-group">
            <label class="form-label">Status / Stage</label>
            <select [(ngModel)]="currentEdit.status" class="form-select">
              <option *ngFor="let s of allStatuses" [value]="s">{{ s }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Meeting Status</label>
            <select [(ngModel)]="currentEdit.meetingStatus" class="form-select">
              <option [ngValue]="null">None</option>
              <option value="Pending">Pending</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div class="flex gap-3 mt-6">
            <button (click)="saveEdit()" class="btn-primary flex-1">Update</button>
            <button (click)="showEditModal=false" class="btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Soft Delete Confirmation Modal -->
    <div *ngIf="showDeleteModal" class="modal-overlay" (click)="showDeleteModal=false">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <h3 class="text-lg font-bold mb-2 text-brand-text">Confirm Delete</h3>
        <p class="text-brand-muted mb-4">Are you sure you want to delete this application for '{{ appToDelete?.candidateId?.name }}'? They will be moved to the Recycle Bin.</p>
        <div class="flex gap-3">
          <button (click)="executeDelete()" class="btn-danger flex-1" style="background:#DC2626;color:white">Delete</button>
          <button (click)="showDeleteModal=false" class="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  `
})
export class ApplicationsComponent implements OnInit {
  applications: any[] = [];
  filteredApps: any[] = [];
  pagedApps: any[] = [];
  jobs: any[] = [];
  loading = true;
  search = '';
  selectedJob = '';
  statusFilter = '';
  activeTab = 'all';
  viewMode: 'list' | 'card' | 'kanban' = 'list';

  // Pagination
  pageSize = 10;
  currentPage = 1;
  get totalPages() { return Math.max(1, Math.ceil(this.filteredApps.length / this.pageSize)); }
  get pageStart() { return this.filteredApps.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1; }
  get pageEnd() { return Math.min(this.currentPage * this.pageSize, this.filteredApps.length); }

  showEditModal = false;
  currentEdit: any = {};
  showDeleteModal = false;
  appToDelete: any = null;

  statCards = [
    { label: 'Total Applications', value: 33, icon: 'fa-solid fa-file-lines',      iconBg: '#EEF6FF', iconColor: '#1976D2' },
    { label: 'Reviewed',           value: 2,  icon: 'fa-solid fa-magnifying-glass', iconBg: '#F5F3FF', iconColor: '#7C3AED' },
    { label: 'Interview Schedule', value: 4,  icon: 'fa-regular fa-calendar-check', iconBg: '#FFFBEB', iconColor: '#D97706' },
    { label: 'Meeting',            value: 2,  icon: 'fa-solid fa-users',            iconBg: '#ECFDF5', iconColor: '#16A34A' },
    { label: 'Offer Sent',         value: 1,  icon: 'fa-solid fa-envelope',         iconBg: '#EEF6FF', iconColor: '#1976D2' },
    { label: 'Rejected',           value: 10, icon: 'fa-solid fa-circle-xmark',     iconBg: '#FEF2F2', iconColor: '#DC2626' },
  ];

  statusTabs = [
    { key: 'all',       label: 'All' },
    { key: 'Applied',   label: 'New Application' },
    { key: 'Reviewed',  label: 'Reviewed' },
    { key: 'Scheduled', label: 'Scheduled' },
    { key: 'Meeting',   label: 'Meeting' },
    { key: 'Interview', label: 'Interviewed' },
    { key: 'Selected',  label: 'Selected' },
    { key: 'Rejected',  label: 'Rejected' },
    { key: 'Offered',   label: 'Offer Sent' },
    { key: 'Hired',     label: 'Completed' },
  ];

  allStatuses = ['Applied','Reviewed','Scheduled','Meeting','Interview','Selected','Offered','Hired','Rejected'];
  stages = [
    {key:'Applied',label:'Applied'},{key:'Reviewed',label:'Reviewed'},
    {key:'Interview',label:'Interview'},{key:'Selected',label:'Selected'},
    {key:'Offered',label:'Offered'},{key:'Hired',label:'Hired'},{key:'Rejected',label:'Rejected'},
  ];

  constructor(private appService: ApplicationService, private jobService: JobService) {}

  ngOnInit() {
    this.loadApplications();
    this.jobService.getJobs().subscribe({ next: j => this.jobs = j, error: () => {} });
  }

  loadApplications() {
    this.appService.getApplications().subscribe({
      next: apps => { this.applications = apps; this.applyFilter(); this.loading = false; },
      error: () => { this.applications = this.getMockApps(); this.applyFilter(); this.loading = false; }
    });
  }

  setTab(key: string) { this.activeTab = key; this.currentPage = 1; this.applyFilter(); }

  getTabCount(key: string) { return key === 'all' ? this.applications.length : this.applications.filter(a => a.status === key).length; }

  applyFilter() {
    this.filteredApps = this.applications.filter(a => {
      const matchS   = !this.search       || (a.candidateId?.name||'').toLowerCase().includes(this.search.toLowerCase());
      const matchJ   = !this.selectedJob  || (a.jobId?._id||a.jobId) === this.selectedJob;
      const matchSt  = !this.statusFilter || a.status === this.statusFilter;
      const matchTab = this.activeTab === 'all' || a.status === this.activeTab;
      return matchS && matchJ && matchSt && matchTab;
    });
    this.updatePage();
  }

  updatePage() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedApps = this.filteredApps.slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePage();
  }

  onPageSizeChange() { this.currentPage = 1; this.updatePage(); }

  getByStage(stage: string) { return this.filteredApps.filter(a => a.status === stage); }

  getNextStatus(current: string): string {
    const idx = this.allStatuses.indexOf(current);
    return idx < this.allStatuses.length - 2 ? this.allStatuses[idx + 1] : '';
  }

  moveStage(app: any, status: string) {
    if (!status) return;
    this.appService.updateStatus(app._id, status).subscribe({
      next: () => { app.status = status; this.applyFilter(); },
      error: () => { app.status = status; this.applyFilter(); }
    });
  }

  openEditModal(app: any) {
    this.currentEdit = { ...app };
    this.showEditModal = true;
  }

  saveEdit() {
    this.appService.updateStatus(this.currentEdit._id, this.currentEdit.status, this.currentEdit.notes).subscribe({
      next: () => {
        const idx = this.applications.findIndex(a => a._id === this.currentEdit._id);
        if (idx !== -1) this.applications[idx] = { ...this.applications[idx], ...this.currentEdit };
        this.applyFilter();
        this.showEditModal = false;
      },
      error: () => {
        const idx = this.applications.findIndex(a => a._id === this.currentEdit._id);
        if (idx !== -1) this.applications[idx] = { ...this.applications[idx], ...this.currentEdit };
        this.applyFilter();
        this.showEditModal = false;
      }
    });
  }

  confirmDelete(app: any) {
    this.appToDelete = app;
    this.showDeleteModal = true;
  }

  executeDelete() {
    if (!this.appToDelete) return;
    const id = this.appToDelete._id;
    if ((this.appService as any).deleteApplication) {
      this.appService.deleteApplication(id).subscribe({
        next: () => {
          this.applications = this.applications.filter(a => a._id !== id);
          this.applyFilter();
          this.showDeleteModal = false;
          this.appToDelete = null;
        },
        error: () => {
          this.applications = this.applications.filter(a => a._id !== id);
          this.applyFilter();
          this.showDeleteModal = false;
          this.appToDelete = null;
        }
      });
    } else {
      this.applications = this.applications.filter(a => a._id !== id);
      this.applyFilter();
      this.showDeleteModal = false;
      this.appToDelete = null;
    }
  }

  getStatusBadge(s: string): string {
    const m: any = { Applied:'badge badge-applied', Reviewed:'badge badge-reviewed', Scheduled:'badge badge-scheduled', Meeting:'badge badge-meeting', Interview:'badge badge-interviewed', Selected:'badge badge-offered', Offered:'badge badge-offered', Hired:'badge badge-hired', Rejected:'badge badge-rejected' };
    return m[s] || 'badge badge-slate';
  }
  getMeetingBadge(s: string): string {
    const m: any = { Pending:'badge badge-pending', Completed:'badge badge-completed', Scheduled:'badge badge-scheduled' };
    return m[s] || 'badge badge-slate';
  }
  getScoreGrad(s: number): string { return s>=80?'linear-gradient(90deg,#16a34a,#4ade80)':s>=60?'linear-gradient(90deg,#d97706,#fbbf24)':'linear-gradient(90deg,#dc2626,#f87171)'; }

  getMockApps() {
    return [
      { _id:'1', appId:'PL751065', candidateId:{name:'Jane Smith',   phone:'+91 9123456789', aiScore:88}, jobId:{title:'Hardware Mobile Repair Technician'},                      status:'Meeting',   appliedDate:new Date('2026-06-05'), meetingStatus:null },
      { _id:'2', appId:'PL126097', candidateId:{name:'John Doe',     phone:'+91 9876543210', aiScore:72}, jobId:{title:'Hardware Mobile Repair Technician'},                      status:'Reviewed',  appliedDate:new Date('2026-06-05'), meetingStatus:null },
      { _id:'3', appId:'PL594577', candidateId:{name:'Pradip Das',   phone:'+91 9733021139', aiScore:65}, jobId:{title:'Customer Support Executive (WFH)'},                      status:'Meeting',   appliedDate:new Date('2026-06-05'), meetingStatus:'Pending' },
      { _id:'4', appId:'PL204658', candidateId:{name:'Samir Roy',    phone:'4545455555',     aiScore:91}, jobId:{title:'Receptionist (Front Desk)'},                             status:'Interview', appliedDate:new Date('2026-05-23'), meetingStatus:'Completed' },
      { _id:'5', appId:'PL882453', candidateId:{name:'Amit Kumar',   phone:'9641445782',     aiScore:85}, jobId:{title:'Receptionist (Front Desk)'},                             status:'Interview', appliedDate:new Date('2026-05-23'), meetingStatus:'Completed' },
      { _id:'6', appId:'PL972082', candidateId:{name:'Pavel Jana',   phone:'+91 9002684111', aiScore:55}, jobId:{title:'Receptionist (Front Desk)'},                             status:'Applied',   appliedDate:new Date('2026-05-23'), meetingStatus:null },
      { _id:'7', appId:'PL330124', candidateId:{name:'Amit Patra',   phone:'+91 9876001234', aiScore:78}, jobId:{title:'Hardware Mobile Repair Technician'},                     status:'Selected',  appliedDate:new Date('2026-05-20'), meetingStatus:'Completed' },
      { _id:'8', appId:'PL441200', candidateId:{name:'Rina Mondal',  phone:'+91 9123400000', aiScore:40}, jobId:{title:'Customer Support Executive'},                            status:'Rejected',  appliedDate:new Date('2026-05-18'), meetingStatus:null },
      { _id:'9', appId:'PL553319', candidateId:{name:'Riya Sen',     phone:'+91 9012345678', aiScore:80}, jobId:{title:'Senior Frontend Developer'},                             status:'Offered',   appliedDate:new Date('2026-05-10'), meetingStatus:'Completed' },
    ];
  }
}
