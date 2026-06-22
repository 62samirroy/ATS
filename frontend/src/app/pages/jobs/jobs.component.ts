import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  styles: [`
    .mobile-view { display: none; }
    @media (max-width: 767px) {
      .desktop-view { display: none !important; }
      .mobile-view { display: flex !important; }
    }
  `],
  template: `
    <div class="animate-fade-in">

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Job Management</h1>
          <p class="page-subtitle">Create, manage and track all job openings</p>
        </div>
        <div style="display:flex;gap:0.5rem">
          <a routerLink="/jobs/recycle-bin" class="btn-secondary" style="display:inline-flex;align-items:center;gap:6px">
            <i class="fa-solid fa-trash-can" style="color:#DC2626"></i> Recycle Bin
          </a>
          <button (click)="showCreateModal = true" id="btn-new-job" class="btn-primary">
            <i class="fa-solid fa-plus" style="font-size:0.75rem"></i> New Job
          </button>
        </div>
      </div>

      <!-- Stat Cards -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:0.75rem;margin-bottom:1rem">
        <div *ngFor="let s of analytics" class="stat-card" style="padding:0.75rem 0.875rem">
          <div style="display:flex;align-items:center;gap:0.5rem">
            <div [style.background]="s.bg" style="width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <i [class]="s.icon" [style.color]="s.color" style="font-size:0.9rem"></i>
            </div>
            <div>
              <div style="font-size:0.625rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.04em">{{ s.label }}</div>
              <div style="font-size:1.25rem;font-weight:800;color:var(--text);line-height:1.1">{{ s.value }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Card -->
      <div class="card" style="padding:0;overflow:hidden">

        <!-- Filter Bar -->
        <div class="filter-bar">
          <div class="search-wrap" style="flex:1;min-width:180px;max-width:280px">
            <svg class="search-icon-inner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input id="job-search" type="text" [(ngModel)]="searchQuery" (input)="applyFilter()" placeholder="Search jobs...">
          </div>
          <select id="job-type-filter" [(ngModel)]="typeFilter" (change)="applyFilter()" class="form-select" style="width:auto;min-width:120px">
            <option value="">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Remote">Remote</option>
          </select>
          <select id="job-status-filter" [(ngModel)]="statusFilter" (change)="applyFilter()" class="form-select" style="width:auto;min-width:110px">
            <option value="">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" style="padding:1.5rem">
          <div *ngFor="let i of [1,2,3,4,5]" class="skeleton" style="height:44px;margin-bottom:6px"></div>
        </div>

        <!-- Empty -->
        <div *ngIf="!loading && filteredJobs.length===0" style="text-align:center;padding:4rem 2rem;color:var(--muted)">
          <i class="fa-solid fa-briefcase" style="font-size:2.5rem;color:var(--border);display:block;margin-bottom:1rem"></i>
          <p style="font-size:1rem;font-weight:600;color:var(--text);margin-bottom:0.25rem">No jobs found</p>
          <p style="font-size:0.875rem;margin-bottom:1rem">Get started by creating your first job posting</p>
          <button (click)="showCreateModal = true" class="btn-primary">Create Job</button>
        </div>

        <!-- ===== DESKTOP TABLE ===== -->
        <div *ngIf="!loading && pagedJobs.length>0" class="desktop-view table-container">
          <table class="table">
            <thead>
              <tr>
                <th style="width:36px"><input type="checkbox" style="width:14px;height:14px;accent-color:var(--primary);cursor:pointer"></th>
                <th>Job</th>
                <th>Location</th>
                <th>Type</th>
                <th>Experience</th>
                <th>Salary</th>
                <th>Status</th>
                <th style="text-align:center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let job of pagedJobs">
                <td><input type="checkbox" style="width:14px;height:14px;accent-color:var(--primary);cursor:pointer"></td>
                <td style="max-width:220px">
                  <div style="font-weight:600;color:var(--text);font-size:0.8125rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ job.title }}</div>
                  <div style="font-size:0.6875rem;color:var(--primary);font-weight:600;margin-top:1px">J-{{ job._id.toString().padStart(5,'0') }}</div>
                  <div style="display:flex;gap:3px;margin-top:3px;flex-wrap:wrap">
                    <span *ngFor="let sk of (job.skills||[]).slice(0,2)" class="badge badge-purple" style="font-size:0.6rem;padding:1px 5px">{{ sk }}</span>
                    <span *ngIf="(job.skills||[]).length>2" class="badge badge-slate" style="font-size:0.6rem;padding:1px 5px">+{{ job.skills.length-2 }}</span>
                  </div>
                </td>
                <td style="font-size:0.8125rem;color:var(--muted)">{{ job.location||'Remote' }}</td>
                <td><span class="badge badge-blue">{{ job.type }}</span></td>
                <td style="font-size:0.8125rem;color:var(--muted)">{{ job.experience ? job.experience+'+ yrs' : '—' }}</td>
                <td style="font-size:0.8125rem;font-weight:600;color:var(--text)">{{ getSalary(job)||'—' }}</td>
                <td>
                  <select [ngModel]="job.status" (ngModelChange)="updateJobStatus(job, $event)" [class]="getStatusBadge(job.status)" style="appearance:none; border:none; outline:none; cursor:pointer;">
                    <option value="Draft" class="text-black">Draft</option>
                    <option value="Published" class="text-black">Published</option>
                    <option value="Closed" class="text-black">Closed</option>
                  </select>
                </td>
                <td>
                  <!-- Icon-only actions -->
                  <div style="display:flex;align-items:center;justify-content:center;gap:4px">
                    <a [routerLink]="['/jobs', job._id]" class="btn-icon btn-icon-primary" title="View Job">
                      <i class="fa-regular fa-eye"></i>
                    </a>
                    <button (click)="openEditModal(job)" class="btn-icon btn-icon-primary" title="Edit Job">
                      <i class="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button *ngIf="job.status==='Draft'" (click)="publish(job)" class="btn-icon btn-icon-success" title="Publish Job">
                      <i class="fa-solid fa-upload" style="font-size:0.7rem"></i>
                    </button>
                    <button (click)="confirmDelete(job)" class="btn-icon btn-icon-danger" title="Delete Job">
                      <i class="fa-regular fa-trash-can"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ===== MOBILE CARD LISTING ===== -->
        <div *ngIf="!loading && pagedJobs.length>0" class="mobile-view" style="flex-direction:column">
          <div *ngFor="let job of pagedJobs; let last=last"
               style="padding:0.875rem 1rem;border-bottom:1px solid var(--border)"
               [style.border-bottom]="last?'none':'1px solid var(--border)'">
            <div style="display:flex;align-items:start;justify-content:space-between;gap:0.5rem;margin-bottom:0.5rem">
              <div style="flex:1;min-width:0">
                <div style="font-weight:600;color:var(--text);font-size:0.875rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ job.title }}</div>
                <div style="font-size:0.6875rem;color:var(--primary);font-weight:600;margin-top:1px">J-{{ job._id.toString().padStart(5,'0') }}</div>
              </div>
              <select [ngModel]="job.status" (ngModelChange)="updateJobStatus(job, $event)" [class]="getStatusBadge(job.status)" style="flex-shrink:0; appearance:none; border:none; outline:none; cursor:pointer;">
                <option value="Draft" class="text-black">Draft</option>
                <option value="Published" class="text-black">Published</option>
                <option value="Closed" class="text-black">Closed</option>
              </select>
            </div>
            <div style="display:flex;align-items:center;gap:1rem;font-size:0.75rem;color:var(--muted);margin-bottom:0.5rem;flex-wrap:wrap">
              <span><i class="fa-solid fa-location-dot" style="margin-right:3px;color:var(--border)"></i>{{ job.location||'Remote' }}</span>
              <span><i class="fa-solid fa-briefcase" style="margin-right:3px;color:var(--border)"></i>{{ job.type }}</span>
              <span *ngIf="job.experience"><i class="fa-solid fa-clock" style="margin-right:3px;color:var(--border)"></i>{{ job.experience }}+ yrs</span>
              <span *ngIf="getSalary(job)" style="font-weight:600;color:var(--text)"><i class="fa-solid fa-money-bill" style="margin-right:3px;color:var(--border)"></i>{{ getSalary(job) }}</span>
            </div>
            <div *ngIf="(job.skills||[]).length>0" style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:0.5rem">
              <span *ngFor="let sk of (job.skills||[]).slice(0,3)" class="badge badge-purple" style="font-size:0.6875rem">{{ sk }}</span>
              <span *ngIf="(job.skills||[]).length>3" class="badge badge-slate" style="font-size:0.6875rem">+{{ job.skills.length-3 }}</span>
            </div>
            <div style="display:flex;gap:0.375rem">
              <a [routerLink]="['/jobs', job._id]" class="btn-icon btn-icon-primary" title="View"><i class="fa-regular fa-eye"></i></a>
              <button (click)="openEditModal(job)" class="btn-icon btn-icon-primary" title="Edit"><i class="fa-regular fa-pen-to-square"></i></button>
              <button *ngIf="job.status==='Draft'" (click)="publish(job)" class="btn-icon btn-icon-success" title="Publish"><i class="fa-solid fa-upload" style="font-size:0.7rem"></i></button>
              <button (click)="confirmDelete(job)" class="btn-icon btn-icon-danger" title="Delete"><i class="fa-regular fa-trash-can"></i></button>
            </div>
          </div>
        </div>

        <!-- ===== PAGINATION ===== -->
        <div *ngIf="!loading && filteredJobs.length>0" class="pagination-bar">
          <span class="pagination-info">Showing {{ pageStart }}–{{ pageEnd }} of {{ filteredJobs.length }} rows</span>
          <div style="display:flex;align-items:center;gap:0.5rem">
            <select class="page-size-select" [(ngModel)]="pageSize" (change)="onPageSizeChange()">
              <option [value]="10">10 / page</option>
              <option [value]="20">20 / page</option>
              <option [value]="50">50 / page</option>
            </select>
          </div>
          <div class="pagination-controls">
            <button class="page-btn" (click)="goToPage(currentPage-1)" [disabled]="currentPage===1">
              <i class="fa-solid fa-chevron-left" style="font-size:0.6rem"></i>&nbsp;Previous
            </button>
            <span style="font-size:0.8125rem;color:var(--muted);white-space:nowrap;padding:0 0.25rem">Page {{ currentPage }} of {{ totalPages }}</span>
            <button class="page-btn" (click)="goToPage(currentPage+1)" [disabled]="currentPage===totalPages">
              Next&nbsp;<i class="fa-solid fa-chevron-right" style="font-size:0.6rem"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Job Modal -->
    <div *ngIf="showCreateModal" class="modal-overlay" (click)="showCreateModal=false">
      <div class="modal-box" style="max-width:600px" (click)="$event.stopPropagation()">
        <h3 class="text-lg font-bold mb-4">{{ isEdit ? 'Edit Job Posting' : 'Create Job Posting' }}</h3>
        <div class="space-y-4">
          <!-- Basic Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-group md:col-span-2">
              <label class="form-label">Job Title *</label>
              <input type="text" [(ngModel)]="newJob.title" class="form-input" placeholder="e.g. Senior Frontend Developer">
            </div>
            <div class="form-group">
              <label class="form-label">Job Type</label>
              <select [(ngModel)]="newJob.type" class="form-select">
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Location</label>
              <input type="text" [(ngModel)]="newJob.location" class="form-input" placeholder="e.g. New York, NY">
            </div>
            <div class="form-group">
              <label class="form-label">Years of Experience</label>
              <input type="number" [(ngModel)]="newJob.experience" class="form-input" placeholder="e.g. 3">
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select [(ngModel)]="newJob.status" class="form-select">
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>
          </div>

          <!-- Salary & Skills -->
          <div class="grid grid-cols-3 gap-4">
            <div class="form-group">
              <label class="form-label">Min Salary</label>
              <input type="number" [(ngModel)]="newJob.salary.min" class="form-input" placeholder="80000">
            </div>
            <div class="form-group">
              <label class="form-label">Max Salary</label>
              <input type="number" [(ngModel)]="newJob.salary.max" class="form-input" placeholder="120000">
            </div>
            <div class="form-group">
              <label class="form-label">Currency</label>
              <select [(ngModel)]="newJob.salary.currency" class="form-select">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Required Skills</label>
            <div class="flex gap-2 mb-3">
              <input type="text" [(ngModel)]="skillsInput" class="form-input flex-1" placeholder="e.g. React, TypeScript..." (keydown.enter)="addSkill($event)">
              <button type="button" (click)="addSkill()" class="btn-primary btn-sm">Add</button>
            </div>
            <div class="flex flex-wrap gap-2">
              <span *ngFor="let skill of newJob.skills; let i = index" class="badge badge-purple flex items-center gap-1.5">
                {{ skill }}
                <button type="button" (click)="removeSkill(i)" class="hover:text-red-400 transition-colors cursor-pointer" style="background:transparent;border:none;padding:0;font-size:1rem;line-height:1">×</button>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Description *</label>
            <textarea [(ngModel)]="newJob.description" class="form-textarea h-24" placeholder="Describe the role..."></textarea>
          </div>
          
          <div class="flex gap-3 mt-2">
            <button (click)="saveJob()" class="btn-primary flex-1" style="justify-content:center" [disabled]="!newJob.title || !newJob.description || creating">
              <ng-container *ngIf="!isEdit">{{ creating ? 'Creating...' : 'Create Job' }}</ng-container>
              <ng-container *ngIf="isEdit">{{ creating ? 'Updating...' : 'Update Job' }}</ng-container>
            </button>
            <button (click)="showCreateModal=false" class="btn-secondary" style="justify-content:center;flex:1">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Soft Delete Confirmation Modal -->
    <div *ngIf="showDeleteModal" class="modal-overlay" (click)="showDeleteModal=false">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <h3 class="text-lg font-bold mb-2 text-brand-text">Confirm Delete</h3>
        <p class="text-brand-muted mb-4">Are you sure you want to delete '{{ jobToDelete?.title }}'? It will be moved to the Recycle Bin.</p>
        <div class="flex gap-3">
          <button (click)="executeDelete()" class="btn-danger flex-1" style="background:#DC2626;color:white">Delete</button>
          <button (click)="showDeleteModal=false" class="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  `
})
export class JobsComponent implements OnInit {
  jobs: any[] = [];
  filteredJobs: any[] = [];
  pagedJobs: any[] = [];
  loading = true;
  searchQuery = '';
  statusFilter = '';
  typeFilter = '';
  analytics: any[] = [];

  // Pagination
  pageSize = 10;
  currentPage = 1;
  get totalPages() { return Math.max(1, Math.ceil(this.filteredJobs.length / this.pageSize)); }
  get pageStart() { return this.filteredJobs.length===0?0:(this.currentPage-1)*this.pageSize+1; }
  get pageEnd()   { return Math.min(this.currentPage*this.pageSize, this.filteredJobs.length); }

  // Create Modal
  showCreateModal = false;
  creating = false;
  isEdit = false;
  editingJobId: string | null = null;
  skillsInput = '';
  newJob: any = { 
    title: '', 
    type: 'Full-time', 
    location: '', 
    experience: 0,
    status: 'Draft',
    salary: { min: null, max: null, currency: 'USD' },
    description: '',
    skills: []
  };

  // Delete Modal
  showDeleteModal = false;
  jobToDelete: any = null;

  constructor(private jobService: JobService) {}

  ngOnInit() { this.loadJobs(); this.loadAnalytics(); }

  loadJobs() {
    this.loading = true;
    this.jobService.getJobs().subscribe({
      next: jobs => { this.jobs = jobs; this.applyFilter(); this.loading = false; },
      error: () => { this.jobs = this.getMockJobs(); this.applyFilter(); this.loading = false; }
    });
  }

  loadAnalytics() {
    this.jobService.getJobAnalytics().subscribe({
      next: data => this.buildAnalytics(data),
      error: () => this.buildAnalytics({ total:12, published:8, draft:3, closed:1 })
    });
  }

  buildAnalytics(data: any) {
    this.analytics = [
      { label:'Total Jobs', value:data.total,     icon:'fa-solid fa-briefcase',    bg:'#EEF6FF', color:'#1976D2' },
      { label:'Published',  value:data.published, icon:'fa-solid fa-circle-check', bg:'#F0FDF4', color:'#16A34A' },
      { label:'Draft',      value:data.draft,     icon:'fa-solid fa-file-pen',     bg:'#FFFBEB', color:'#D97706' },
      { label:'Closed',     value:data.closed,    icon:'fa-solid fa-lock',         bg:'#FEF2F2', color:'#DC2626' },
    ];
  }

  applyFilter() {
    this.filteredJobs = this.jobs.filter(j => {
      const matchS = !this.searchQuery || j.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchSt = !this.statusFilter || j.status === this.statusFilter;
      const matchT  = !this.typeFilter   || j.type   === this.typeFilter;
      return matchS && matchSt && matchT;
    });
    this.currentPage = 1;
    this.updatePage();
  }

  updatePage() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedJobs = this.filteredJobs.slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePage();
  }

  onPageSizeChange() { this.currentPage = 1; this.updatePage(); }

  publish(job: any) {
    this.jobService.publishJob(job._id).subscribe({
      next: () => { job.status = 'Published'; },
      error: () => { job.status = 'Published'; }
    });
  }

  addSkill(event?: any) {
    if (event) event.preventDefault();
    if (this.skillsInput.trim()) {
      if (!this.newJob.skills) this.newJob.skills = [];
      this.newJob.skills.push(this.skillsInput.trim());
      this.skillsInput = '';
    }
  }

  removeSkill(index: number) {
    if (this.newJob.skills) {
      this.newJob.skills.splice(index, 1);
    }
  }

  openEditModal(job: any) {
    this.isEdit = true;
    this.editingJobId = job._id;
    this.newJob = JSON.parse(JSON.stringify(job));
    if (!this.newJob.skills) this.newJob.skills = [];
    this.skillsInput = '';
    this.showCreateModal = true;
  }

  updateJobStatus(job: any, newStatus: string) {
    job.status = newStatus;
    if ((this.jobService as any).updateJob) {
      (this.jobService as any).updateJob(job._id, { status: newStatus }).subscribe({
        next: () => { this.applyFilter(); },
        error: () => { this.applyFilter(); }
      });
    } else {
      this.applyFilter();
    }
  }

  saveJob() {
    this.creating = true;
    const payload = { ...this.newJob };
    
    if (this.isEdit && this.editingJobId) {
      if ((this.jobService as any).updateJob) {
        (this.jobService as any).updateJob(this.editingJobId, payload).subscribe({
          next: (j: any) => {
            const idx = this.jobs.findIndex(x => x._id === this.editingJobId);
            if(idx !== -1) this.jobs[idx] = j;
            this.applyFilter();
            this.resetCreateModal();
          },
          error: () => {
            const idx = this.jobs.findIndex(x => x._id === this.editingJobId);
            if(idx !== -1) this.jobs[idx] = { ...this.jobs[idx], ...payload };
            this.applyFilter();
            this.resetCreateModal();
          }
        });
      } else {
        const idx = this.jobs.findIndex(x => x._id === this.editingJobId);
        if(idx !== -1) this.jobs[idx] = { ...this.jobs[idx], ...payload };
        this.applyFilter();
        this.resetCreateModal();
      }
    } else {
      this.jobService.createJob(payload).subscribe({
        next: (j) => {
          this.jobs.unshift(j);
          this.applyFilter();
          this.resetCreateModal();
        },
        error: () => {
          // Fallback for mock
          const mockJ = {
            _id: Math.random().toString(),
            ...payload
          };
          this.jobs.unshift(mockJ);
          this.applyFilter();
          this.resetCreateModal();
        }
      });
    }
  }

  resetCreateModal() {
    this.showCreateModal = false;
    this.creating = false;
    this.isEdit = false;
    this.editingJobId = null;
    this.skillsInput = '';
    this.newJob = { 
      title: '', type: 'Full-time', location: '', experience: 0, status: 'Draft', 
      salary: { min: null, max: null, currency: 'USD' }, description: '', skills: [] 
    };
  }

  confirmDelete(job: any) {
    this.jobToDelete = job;
    this.showDeleteModal = true;
  }

  executeDelete() {
    if (!this.jobToDelete) return;
    const id = this.jobToDelete._id;
    this.jobService.deleteJob(id).subscribe({
      next: () => { 
        this.jobs = this.jobs.filter(j => j._id !== id); 
        this.applyFilter(); 
        this.showDeleteModal = false;
        this.jobToDelete = null;
      },
      error: () => { 
        this.jobs = this.jobs.filter(j => j._id !== id); 
        this.applyFilter(); 
        this.showDeleteModal = false;
        this.jobToDelete = null;
      }
    });
  }

  getSalary(job: any): string {
    if (!job?.salary?.min) return '';
    return `$${Math.round(job.salary.min/1000)}k–$${Math.round(job.salary.max/1000)}k`;
  }

  getStatusBadge(s: string): string {
    const m: any = { Published:'badge badge-green', Draft:'badge badge-yellow', Closed:'badge badge-red' };
    return m[s] || 'badge badge-slate';
  }

  getMockJobs() {
    return [
      { _id:'1', title:'Senior Frontend Developer',   skills:['Angular','TypeScript','RxJS','Tailwind'], experience:3, type:'Full-time', status:'Published', location:'New York, NY',      salary:{min:110000,max:150000} },
      { _id:'2', title:'Full Stack Node.js Engineer', skills:['Node.js','Express','MongoDB','Docker'],   experience:2, type:'Full-time', status:'Published', location:'San Francisco, CA', salary:{min:120000,max:160000} },
      { _id:'3', title:'Product Designer (UI/UX)',    skills:['Figma','UI/UX','Prototyping'],            experience:2, type:'Remote',    status:'Draft',     location:'Remote',            salary:{min:90000, max:120000} },
      { _id:'4', title:'DevOps Engineer',             skills:['AWS','Docker','Kubernetes','Terraform'],  experience:4, type:'Full-time', status:'Published', location:'Austin, TX',        salary:{min:130000,max:170000} },
      { _id:'5', title:'AI/ML Engineer',              skills:['Python','TensorFlow','LLMs','FastAPI'],   experience:3, type:'Full-time', status:'Published', location:'Remote',            salary:{min:140000,max:190000} },
      { _id:'6', title:'HR Business Partner',         skills:['HR','Recruiting','Talent Strategy'],      experience:5, type:'Full-time', status:'Closed',    location:'Chicago, IL',       salary:{min:85000, max:110000} },
    ];
  }
}
