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

      <!-- Filters -->
      <div class="card">
        <div class="flex flex-wrap gap-3">
          <div class="search-bar flex-1 min-w-48">
            <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input id="candidate-search" type="text" [(ngModel)]="searchQuery" (input)="filterCandidates()" class="search-input" placeholder="Search candidates...">
          </div>
          <select id="job-rank-filter" [(ngModel)]="selectedJob" (change)="filterCandidates()" class="form-select w-48">
            <option value="">All Candidates</option>
            <option *ngFor="let job of jobs" [value]="job._id">{{ job.title }}</option>
          </select>
          <select [(ngModel)]="sortBy" (change)="filterCandidates()" class="form-select w-40">
            <option value="aiScore">AI Score</option>
            <option value="name">Name</option>
            <option value="experience">Experience</option>
          </select>
        </div>
      </div>

      <!-- Candidate Cards -->
      <div *ngIf="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div *ngFor="let i of [1,2,3,4,5,6]" class="card"><div class="skeleton h-48 rounded-xl"></div></div>
      </div>

      <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div *ngFor="let c of filteredCandidates" class="card-hover">
          <!-- Header -->
          <div class="flex items-start gap-3 mb-3">
            <div class="avatar w-12 h-12 text-lg flex items-center justify-center flex-shrink-0">{{ c.name.charAt(0) }}</div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-white truncate">{{ c.name }}</h3>
              <p class="text-sm text-slate-400">{{ c.email }}</p>
              <p class="text-xs text-slate-500">{{ c.experience }} yrs experience</p>
            </div>
            <!-- AI Score -->
            <div *ngIf="c.aiScore" class="flex-shrink-0 text-center">
              <div class="text-xl font-bold" [class]="getScoreColor(c.aiScore)">{{ c.aiScore }}%</div>
              <div class="text-xs text-slate-500">AI Score</div>
            </div>
          </div>

          <!-- AI Score bar -->
          <div *ngIf="c.aiScore" class="mb-3">
            <div class="ai-score-bar">
              <div class="ai-score-fill" [style.width.%]="c.aiScore" [style.background]="getScoreGradient(c.aiScore)"></div>
            </div>
          </div>

          <!-- Skills -->
          <div class="flex flex-wrap gap-1.5 mb-3">
            <span *ngFor="let skill of (c.skills || []).slice(0,4)" class="badge badge-blue">{{ skill }}</span>
            <span *ngIf="(c.skills || []).length > 4" class="badge badge-slate">+{{ c.skills.length - 4 }}</span>
          </div>

          <!-- AI Summary -->
          <div *ngIf="c.aiSummary" class="p-3 bg-primary-600/5 border border-primary-600/20 rounded-xl mb-3">
            <p class="text-xs text-primary-300 leading-relaxed line-clamp-2">{{ c.aiSummary }}</p>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 pt-3 border-t border-slate-700/50">
            <a [routerLink]="['/candidates', c._id]" class="btn-secondary btn-sm flex-1 text-center">Profile</a>
            <button *ngIf="selectedJob" (click)="rankCandidate(c)" class="btn-primary btn-sm" [disabled]="rankingId === c._id">
              <svg *ngIf="rankingId !== c._id" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1"/></svg>
              <svg *ngIf="rankingId === c._id" class="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              AI Rank
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Candidate Modal -->
    <div *ngIf="showAddModal" class="modal-overlay" (click)="showAddModal=false">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <h3 class="text-lg font-bold text-white mb-4">Add Candidate</h3>
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
