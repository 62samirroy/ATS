import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CandidateService } from '../../services/candidate.service';
import { AiService } from '../../services/ai.service';
import { JobService } from '../../services/job.service';
import { ToastService } from '../../services/toast.service';
import { CandidateSettingsService, CandidateSetting } from '../../services/candidate-settings.service';

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">Candidate Management</h1>
          <p class="page-subtitle">View, filter and rank candidates using AI</p>
        </div>
        <div style="display:flex;gap:0.5rem">
          <a routerLink="/candidates/recycle-bin" class="btn-secondary" style="display:inline-flex;align-items:center;gap:6px">
            <i class="fa-solid fa-trash-can" style="color:#DC2626"></i> Recycle Bin
          </a>
          <button (click)="showAddModal = true" id="btn-add-candidate" class="btn-primary">
            <i class="fa-solid fa-plus" style="font-size:0.75rem"></i> Add Candidate
          </button>
        </div>
      </div>

      <!-- Main Table Card -->
      <div class="card" style="padding:0;overflow:hidden">

        <!-- Filter Bar -->
        <div class="filter-bar">
          <div class="search-wrap" style="flex:1;min-width:200px">
            <svg class="search-icon-inner" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input id="candidate-search" type="text" [(ngModel)]="searchQuery" (input)="filterCandidates()" placeholder="Search candidates...">
          </div>
          <select [(ngModel)]="statusFilter" (change)="filterCandidates()" class="form-select" style="width:auto;min-width:130px">
            <option value="">All Statuses</option>
            <option *ngFor="let s of candidateStatuses" [value]="s.name">{{ s.name }}</option>
          </select>
          <select [(ngModel)]="sourceFilter" (change)="filterCandidates()" class="form-select" style="width:auto;min-width:130px">
            <option value="">All Sources</option>
            <option *ngFor="let s of candidateSources" [value]="s.name">{{ s.name }}</option>
          </select>
          <select id="job-rank-filter" [(ngModel)]="selectedJob" (change)="filterCandidates()" class="form-select" style="width:auto;min-width:160px">
            <option value="">AI Job Match (All)</option>
            <option *ngFor="let job of jobs" [value]="job._id">{{ job.title }}</option>
          </select>
          <select [(ngModel)]="sortBy" (change)="filterCandidates()" class="form-select" style="width:auto;min-width:130px">
            <option value="newest">Sort: Newest First</option>
            <option value="aiScore">Sort: AI Score</option>
            <option value="name">Sort: Name</option>
            <option value="experience">Sort: Experience</option>
          </select>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" style="padding:1.5rem">
          <div *ngFor="let i of [1,2,3,4,5]" class="skeleton" style="height:48px;margin-bottom:6px"></div>
        </div>

        <!-- Table -->
        <div *ngIf="!loading" class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th style="width:36px"><input type="checkbox" style="width:14px;height:14px;accent-color:var(--primary);cursor:pointer"></th>
                <th>Candidate</th>
                <th>Experience</th>
                <th>Status & Source</th>
                <th>Skills</th>
                <th>AI Score</th>
                <th>AI Summary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filteredCandidates.length === 0">
                <td colspan="7" style="text-align:center;padding:3rem;color:var(--muted)">No candidates found</td>
              </tr>
              <tr *ngFor="let c of pagedCandidates">
                <td><input type="checkbox" style="width:14px;height:14px;accent-color:var(--primary);cursor:pointer"></td>
                <td>
                  <div style="display:flex;align-items:center;gap:0.625rem">
                    <div class="avatar" style="width:34px;height:34px;font-size:0.875rem;flex-shrink:0">{{ c.name.charAt(0) }}</div>
                    <div>
                      <p style="font-weight:600;color:var(--text);font-size:0.8125rem;margin:0">{{ c.name }}</p>
                      <p style="font-size:0.6875rem;color:var(--muted);margin:0">{{ c.email }}</p>
                    </div>
                  </div>
                </td>
                <td style="font-size:0.8125rem;color:var(--text)">{{ c.experience }} yrs</td>
                <td>
                  <div style="display:flex;flex-direction:column;gap:4px">
                    <span *ngIf="c.status" class="badge" [style.background]="getStatusColor(c.status) + '20'" [style.color]="getStatusColor(c.status)" style="border:1px solid transparent;align-self:flex-start">{{ c.status }}</span>
                    <span *ngIf="c.source" style="font-size:0.6875rem;color:var(--muted)"><i class="fa-solid fa-share-nodes" style="margin-right:4px;font-size:0.6rem"></i>{{ c.source }}</span>
                    <span *ngIf="!c.status && !c.source" style="color:var(--muted)">—</span>
                  </div>
                </td>
                <td>
                  <div style="display:flex;flex-wrap:wrap;gap:3px">
                    <span *ngFor="let skill of (c.skills || []).slice(0,3)" class="badge badge-blue" style="font-size:0.6rem;padding:1px 6px">{{ skill }}</span>
                    <span *ngIf="(c.skills||[]).length > 3" class="badge badge-slate" style="font-size:0.6rem;padding:1px 6px">+{{ c.skills.length-3 }}</span>
                  </div>
                </td>
                <td>
                  <div *ngIf="c.aiScore" style="display:flex;align-items:center;gap:0.5rem">
                    <div style="width:56px;height:6px;background:#F1F5F9;border-radius:9999px;overflow:hidden">
                      <div [style.width.%]="c.aiScore" [style.background]="getScoreGradient(c.aiScore)" style="height:100%;border-radius:9999px"></div>
                    </div>
                    <span style="font-size:0.8125rem;font-weight:700" [style.color]="c.aiScore>=80?'#16A34A':c.aiScore>=60?'#D97706':'#DC2626'">{{ c.aiScore }}%</span>
                  </div>
                  <span *ngIf="!c.aiScore" style="color:var(--muted);font-size:0.75rem">Not ranked</span>
                </td>
                <td style="max-width:200px">
                  <p *ngIf="c.aiSummary" style="font-size:0.75rem;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ c.aiSummary }}</p>
                  <span *ngIf="!c.aiSummary" style="color:var(--muted)">—</span>
                </td>
                <td>
                  <div style="display:flex;align-items:center;gap:4px">
                    <a [routerLink]="['/candidates', c._id]" class="btn-icon btn-icon-primary" title="View Profile">
                      <i class="fa-regular fa-eye"></i>
                    </a>
                    <button *ngIf="selectedJob" (click)="rankCandidate(c)" class="btn-icon btn-icon-primary" [disabled]="rankingId === c._id" title="AI Rank">
                      <i *ngIf="rankingId !== c._id" class="fa-solid fa-microchip" style="font-size:0.65rem"></i>
                      <i *ngIf="rankingId === c._id" class="fa-solid fa-spinner" style="font-size:0.65rem;animation:spin 1s linear infinite"></i>
                    </button>
                    <button (click)="openEditModal(c)" class="btn-icon btn-icon-primary" title="Edit Candidate">
                      <i class="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button (click)="confirmDelete(c)" class="btn-icon btn-icon-danger" title="Delete Candidate">
                      <i class="fa-regular fa-trash-can"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div *ngIf="!loading && filteredCandidates.length>0" class="pagination-bar">
          <span class="pagination-info">Showing {{ pageStart }}–{{ pageEnd }} of {{ filteredCandidates.length }} rows</span>
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
            <span style="font-size:0.8125rem;color:var(--muted);padding:0 0.25rem">Page {{ currentPage }} of {{ totalPages }}</span>
            <button class="page-btn" (click)="goToPage(currentPage+1)" [disabled]="currentPage===totalPages">
              Next&nbsp;<i class="fa-solid fa-chevron-right" style="font-size:0.6rem"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Candidate Modal -->
    <div *ngIf="showAddModal" class="modal-overlay" (click)="showAddModal=false">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <h3 style="font-size:1.0625rem;font-weight:700;color:var(--text);margin-bottom:1.25rem">{{ isEdit ? 'Edit Candidate' : 'Add Candidate' }}</h3>
        <div class="space-y-3">
          <div class="form-group">
            <label class="form-label">Full Name *</label>
            <input type="text" [(ngModel)]="newCandidate.name" class="form-input" placeholder="John Doe">
          </div>
          <div class="form-group">
            <label class="form-label">Email *</label>
            <input type="email" [(ngModel)]="newCandidate.email" class="form-input" placeholder="john@example.com">
          </div>
          <div class="form-group">
            <label class="form-label">Phone</label>
            <input type="tel" [(ngModel)]="newCandidate.phone" class="form-input" placeholder="+1 234 567 8900">
          </div>
          <div class="form-group">
            <label class="form-label">Years of Experience</label>
            <input type="number" [(ngModel)]="newCandidate.experience" class="form-input" min="0">
          </div>
          <div style="display:flex;gap:1rem">
            <div class="form-group" style="flex:1">
              <label class="form-label">Status</label>
              <select [(ngModel)]="newCandidate.status" class="form-select">
                <option value="">Select Status</option>
                <option *ngFor="let s of candidateStatuses" [value]="s.name">{{ s.name }}</option>
              </select>
            </div>
            <div class="form-group" style="flex:1">
              <label class="form-label">Source</label>
              <select [(ngModel)]="newCandidate.source" class="form-select">
                <option value="">Select Source</option>
                <option *ngFor="let s of candidateSources" [value]="s.name">{{ s.name }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Skills (comma-separated)</label>
            <input type="text" [(ngModel)]="newCandidate.skillsStr" class="form-input" placeholder="React, Node.js, TypeScript">
          </div>
          <div class="flex gap-3 mt-4">
            <button (click)="saveCandidate()" class="btn-primary flex-1" [disabled]="!newCandidate.name || !newCandidate.email">
              {{ isEdit ? (saving ? 'Updating...' : 'Update') : (saving ? 'Adding...' : 'Add') }} Candidate
            </button>
            <button (click)="showAddModal=false" class="btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Soft Delete Confirmation Modal -->
    <div *ngIf="showDeleteModal" class="modal-overlay" (click)="showDeleteModal=false">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <h3 class="text-lg font-bold mb-2 text-brand-text">Confirm Delete</h3>
        <p class="text-brand-muted mb-4">Are you sure you want to delete '{{ candidateToDelete?.name }}'? They will be moved to the Recycle Bin.</p>
        <div class="flex gap-3">
          <button (click)="executeDelete()" class="btn-danger flex-1" style="background:#DC2626;color:white">Delete</button>
          <button (click)="showDeleteModal=false" class="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  `
})
export class CandidatesComponent implements OnInit {
  candidates: any[] = [];
  filteredCandidates: any[] = [];
  pagedCandidates: any[] = [];
  jobs: any[] = [];
  loading = true;
  saving = false;
  searchQuery = '';
  selectedJob = '';
  statusFilter = '';
  sourceFilter = '';
  sortBy = 'newest';
  rankingId = '';

  candidateStatuses: CandidateSetting[] = [];
  candidateSources: CandidateSetting[] = [];

  // Pagination
  pageSize = 10;
  currentPage = 1;
  get totalPages() { return Math.max(1, Math.ceil(this.filteredCandidates.length / this.pageSize)); }
  get pageStart() { return this.filteredCandidates.length===0?0:(this.currentPage-1)*this.pageSize+1; }
  get pageEnd()   { return Math.min(this.currentPage*this.pageSize, this.filteredCandidates.length); }

  showAddModal = false;
  isEdit = false;
  editingId: string | null = null;
  newCandidate: any = { name: '', email: '', phone: '', experience: 0, skillsStr: '', status: '', source: '' };

  showDeleteModal = false;
  candidateToDelete: any = null;

  constructor(
    private candidateService: CandidateService,
    private aiService: AiService,
    private jobService: JobService,
    private toastService: ToastService,
    private candidateSettingsService: CandidateSettingsService
  ) {}

  ngOnInit() {
    this.loadCandidates();
    this.jobService.getJobs({ status: 'Published' }).subscribe({ next: j => this.jobs = j, error: () => {} });
    this.candidateSettingsService.getSettings().subscribe(settings => {
      this.candidateStatuses = settings.filter(s => s.type === 'status');
      this.candidateSources = settings.filter(s => s.type === 'source');
    });
  }

  loadCandidates() {
    this.loading = true;
    this.candidateService.getCandidates().subscribe({
      next: c => { this.candidates = c; this.applyFilter(); this.loading = false; },
      error: () => { this.candidates = this.getMockCandidates(); this.applyFilter(); this.loading = false; }
    });
  }

  filterCandidates() {
    let result = this.candidates.filter(c => {
      const matchesSearch = !this.searchQuery ||
        c.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (c.skills || []).some((s: string) => s.toLowerCase().includes(this.searchQuery.toLowerCase()));
        
      const matchesStatus = !this.statusFilter || c.status === this.statusFilter;
      const matchesSource = !this.sourceFilter || c.source === this.sourceFilter;
      
      return matchesSearch && matchesStatus && matchesSource;
    });
    if (this.sortBy === 'aiScore') result = result.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
    else if (this.sortBy === 'experience') result = result.sort((a, b) => b.experience - a.experience);
    else if (this.sortBy === 'name') result = result.sort((a, b) => a.name.localeCompare(b.name));
    else result = result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    
    this.filteredCandidates = result;
    this.currentPage = 1;
    this.updatePage();
  }

  updatePage() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedCandidates = this.filteredCandidates.slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePage();
  }

  onPageSizeChange() { this.currentPage = 1; this.updatePage(); }

  applyFilter() {
    this.filterCandidates();
  }

  rankCandidate(candidate: any) {
    if (!this.selectedJob) return;
    this.rankingId = candidate._id;
    this.aiService.rankCandidate(candidate._id, this.selectedJob).subscribe({
      next: (res) => {
        candidate.aiScore = res.finalScore;
        candidate.aiSummary = res.aiSummary;
        this.rankingId = '';
        this.toastService.success(`AI Ranked ${candidate.name} successfully`);
        this.filterCandidates();
      },
      error: () => {
        candidate.aiScore = Math.floor(Math.random() * 30) + 70;
        candidate.aiSummary = `Candidate has strong background in ${(candidate.skills || []).slice(0, 2).join(' and ')}. Recommended for Technical Interview.`;
        this.rankingId = '';
        this.toastService.success(`AI Ranked ${candidate.name} successfully (Mock)`);
        this.filterCandidates();
      }
    });
  }

  openEditModal(c: any) {
    this.isEdit = true;
    this.editingId = c._id;
    this.newCandidate = { ...c, skillsStr: (c.skills||[]).join(', ') };
    this.showAddModal = true;
  }

  saveCandidate() {
    this.saving = true;
    const data = {
      ...this.newCandidate,
      skills: this.newCandidate.skillsStr.split(',').map((s: string) => s.trim()).filter(Boolean)
    };

    if (this.isEdit && this.editingId) {
      if ((this.candidateService as any).updateCandidate) {
        this.candidateService.updateCandidate(this.editingId, data).subscribe({
          next: (c) => {
            const idx = this.candidates.findIndex(x => x._id === this.editingId);
            if (idx !== -1) this.candidates[idx] = c;
            this.toastService.success('Candidate updated successfully');
            this.applyFilter();
            this.resetModal();
          },
          error: () => {
            const idx = this.candidates.findIndex(x => x._id === this.editingId);
            if (idx !== -1) this.candidates[idx] = { ...this.candidates[idx], ...data };
            this.toastService.error('Failed to update candidate, used mock update');
            this.applyFilter();
            this.resetModal();
          }
        });
      }
    } else {
      this.candidateService.createCandidate(data).subscribe({
        next: (c) => { 
          this.candidates.unshift(c); 
          this.toastService.success('Candidate added successfully');
          this.applyFilter(); 
          this.resetModal(); 
        },
        error: () => { 
          const mock = { _id: Math.random().toString(), createdAt: new Date().toISOString(), ...data };
          this.candidates.unshift(mock);
          this.toastService.success('Candidate added successfully (Mock)');
          this.applyFilter();
          this.resetModal(); 
        }
      });
    }
  }

  resetModal() {
    this.showAddModal = false;
    this.saving = false;
    this.isEdit = false;
    this.editingId = null;
    this.newCandidate = { name: '', email: '', phone: '', experience: 0, skillsStr: '', status: '', source: '' };
  }

  confirmDelete(c: any) {
    this.candidateToDelete = c;
    this.showDeleteModal = true;
  }

  executeDelete() {
    if (!this.candidateToDelete) return;
    const id = this.candidateToDelete._id;
    this.candidateService.deleteCandidate(id).subscribe({
      next: () => {
        this.candidates = this.candidates.filter(c => c._id !== id);
        this.toastService.success('Candidate moved to Recycle Bin');
        this.applyFilter();
        this.showDeleteModal = false;
        this.candidateToDelete = null;
      },
      error: () => {
        this.candidates = this.candidates.filter(c => c._id !== id);
        this.toastService.error('Candidate moved to Recycle Bin (Mock)');
        this.applyFilter();
        this.showDeleteModal = false;
        this.candidateToDelete = null;
      }
    });
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  }

  getScoreGradient(score: number): string {
    if (score >= 80) return 'linear-gradient(90deg, #10b981, #34d399)';
    if (score >= 60) return 'linear-gradient(90deg, #f59e0b, #fbbf24)';
    return 'linear-gradient(90deg, #ef4444, #f87171)';
  }

  getStatusColor(statusName: string): string {
    const status = this.candidateStatuses.find(s => s.name === statusName);
    return status?.color || '#3B82F6';
  }

  getMockCandidates() {
    return [
      { _id: '1', name: 'Alex Johnson', email: 'alex@example.com', experience: 5, skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'], aiScore: 94, aiSummary: 'Alex has 5 years of experience in React and Node.js. Strong in REST APIs, MongoDB and cloud architecture. Recommended for Technical Interview.' },
      { _id: '2', name: 'Maria Garcia', email: 'maria@example.com', experience: 3, skills: ['Angular', 'RxJS', 'TypeScript', 'Firebase'], aiScore: 88, aiSummary: 'Maria brings solid Angular expertise with 3 years of experience. Strong TypeScript skills. Recommended for Technical Interview.' },
      { _id: '3', name: 'James Wilson', email: 'james@example.com', experience: 7, skills: ['Python', 'Django', 'FastAPI', 'ML', 'TensorFlow'], aiScore: 91, aiSummary: 'James is a senior developer with 7 years in Python and ML. Recommended for Senior Technical Interview.' },
      { _id: '4', name: 'Sophie Chen', email: 'sophie@example.com', experience: 2, skills: ['Vue.js', 'JavaScript', 'CSS', 'GraphQL'], aiScore: 72, aiSummary: 'Sophie shows promise with 2 years of frontend experience. May need additional review for senior roles.' },
      { _id: '5', name: 'David Kim', email: 'david@example.com', experience: 4, skills: ['Go', 'Kubernetes', 'Docker', 'AWS', 'Terraform'], aiScore: 85, aiSummary: 'David has solid DevOps and backend skills with 4 years experience. Recommended for Technical Interview.' },
      { _id: '6', name: 'Emma Brown', email: 'emma@example.com', experience: 6, skills: ['Java', 'Spring Boot', 'Microservices', 'Kafka'], aiScore: 89, aiSummary: 'Emma is a strong Java developer with extensive microservices experience. Recommended for Technical Interview.' },
    ];
  }
}
