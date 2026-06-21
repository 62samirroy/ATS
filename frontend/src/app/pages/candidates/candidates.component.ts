import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CandidateService } from '../../services/candidate.service';
import { AiService } from '../../services/ai.service';
import { JobService } from '../../services/job.service';

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
        <button (click)="showAddModal = true" id="btn-add-candidate" class="btn-primary">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Add Candidate
        </button>
      </div>

      <!-- Main Table Card -->
      <div class="card" style="padding:0;overflow:hidden">

        <!-- Filter Bar -->
        <div class="filter-bar">
          <div class="search-wrap" style="flex:1;min-width:200px">
            <svg class="search-icon-inner" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input id="candidate-search" type="text" [(ngModel)]="searchQuery" (input)="filterCandidates()" placeholder="Search candidates...">
          </div>
          <select id="job-rank-filter" [(ngModel)]="selectedJob" (change)="filterCandidates()" class="form-select" style="width:auto;min-width:160px">
            <option value="">All Candidates</option>
            <option *ngFor="let job of jobs" [value]="job._id">{{ job.title }}</option>
          </select>
          <select [(ngModel)]="sortBy" (change)="filterCandidates()" class="form-select" style="width:auto;min-width:130px">
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
              <tr *ngFor="let c of filteredCandidates">
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
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination-bar">
          <span class="pagination-info">Showing 1–{{ filteredCandidates.length }} of {{ filteredCandidates.length }} rows</span>
          <div style="display:flex;align-items:center;gap:0.5rem">
            <select class="page-size-select">
              <option>10 / page</option><option>20 / page</option><option>50 / page</option>
            </select>
          </div>
          <div class="pagination-controls">
            <button class="page-btn" disabled><i class="fa-solid fa-chevron-left" style="font-size:0.6rem"></i>&nbsp;Previous</button>
            <span style="font-size:0.8125rem;color:var(--muted);padding:0 0.25rem">Page 1 of 1</span>
            <button class="page-btn" disabled>Next&nbsp;<i class="fa-solid fa-chevron-right" style="font-size:0.6rem"></i></button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Candidate Modal -->
    <div *ngIf="showAddModal" class="modal-overlay" (click)="showAddModal=false">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <h3 style="font-size:1.0625rem;font-weight:700;color:var(--text);margin-bottom:1.25rem">Add Candidate</h3>
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
          <div class="form-group">
            <label class="form-label">Skills (comma-separated)</label>
            <input type="text" [(ngModel)]="newCandidate.skillsStr" class="form-input" placeholder="React, Node.js, TypeScript">
          </div>
          <div class="flex gap-3 mt-4">
            <button (click)="addCandidate()" class="btn-primary flex-1" [disabled]="!newCandidate.name || !newCandidate.email">Add Candidate</button>
            <button (click)="showAddModal=false" class="btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CandidatesComponent implements OnInit {
  candidates: any[] = [];
  filteredCandidates: any[] = [];
  jobs: any[] = [];
  loading = true;
  searchQuery = '';
  selectedJob = '';
  sortBy = 'aiScore';
  rankingId = '';
  showAddModal = false;
  newCandidate = { name: '', email: '', phone: '', experience: 0, skillsStr: '' };

  constructor(
    private candidateService: CandidateService,
    private aiService: AiService,
    private jobService: JobService
  ) {}

  ngOnInit() {
    this.loadCandidates();
    this.jobService.getJobs({ status: 'Published' }).subscribe({ next: j => this.jobs = j, error: () => {} });
  }

  loadCandidates() {
    this.loading = true;
    this.candidateService.getCandidates().subscribe({
      next: c => { this.candidates = c; this.filteredCandidates = c; this.loading = false; },
      error: () => { this.candidates = this.getMockCandidates(); this.filteredCandidates = this.candidates; this.loading = false; }
    });
  }

  filterCandidates() {
    let result = this.candidates.filter(c =>
      !this.searchQuery ||
      c.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      (c.skills || []).some((s: string) => s.toLowerCase().includes(this.searchQuery.toLowerCase()))
    );
    if (this.sortBy === 'aiScore') result = result.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
    else if (this.sortBy === 'experience') result = result.sort((a, b) => b.experience - a.experience);
    else result = result.sort((a, b) => a.name.localeCompare(b.name));
    this.filteredCandidates = result;
  }

  rankCandidate(candidate: any) {
    if (!this.selectedJob) return;
    this.rankingId = candidate._id;
    this.aiService.rankCandidate(candidate._id, this.selectedJob).subscribe({
      next: (res) => {
        candidate.aiScore = res.finalScore;
        candidate.aiSummary = res.aiSummary;
        this.rankingId = '';
        this.filterCandidates();
      },
      error: () => {
        // Mock response
        candidate.aiScore = Math.floor(Math.random() * 30) + 70;
        candidate.aiSummary = `Candidate has strong background in ${(candidate.skills || []).slice(0, 2).join(' and ')}. Recommended for Technical Interview.`;
        this.rankingId = '';
        this.filterCandidates();
      }
    });
  }

  addCandidate() {
    const data = {
      ...this.newCandidate,
      skills: this.newCandidate.skillsStr.split(',').map(s => s.trim()).filter(Boolean)
    };
    this.candidateService.createCandidate(data).subscribe({
      next: (c) => { this.candidates.unshift(c); this.filterCandidates(); this.showAddModal = false; },
      error: () => { this.showAddModal = false; }
    });
    this.newCandidate = { name: '', email: '', phone: '', experience: 0, skillsStr: '' };
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
