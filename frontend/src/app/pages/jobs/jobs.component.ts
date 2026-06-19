import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">Job Management</h1>
          <p class="page-subtitle">Create, manage and track all job openings</p>
        </div>
        <a routerLink="/jobs/create" id="btn-new-job" class="btn-primary">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          New Job
        </a>
      </div>

      <!-- Analytics mini cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div *ngFor="let stat of analytics" class="card flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" [style.background]="stat.bg">
            <span class="text-lg">{{ stat.icon }}</span>
          </div>
          <div>
            <p class="text-xl font-bold text-white">{{ stat.value }}</p>
            <p class="text-xs text-slate-400">{{ stat.label }}</p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card">
        <div class="flex flex-wrap gap-3">
          <div class="search-bar flex-1 min-w-48">
            <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input id="job-search" type="text" [(ngModel)]="searchQuery" (input)="filterJobs()" class="search-input" placeholder="Search jobs...">
          </div>
          <select id="job-status-filter" [(ngModel)]="statusFilter" (change)="filterJobs()" class="form-select w-40">
            <option value="">All Status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Closed">Closed</option>
          </select>
          <select id="job-type-filter" [(ngModel)]="typeFilter" (change)="filterJobs()" class="form-select w-40">
            <option value="">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Remote">Remote</option>
          </select>
        </div>
      </div>

      <!-- Job cards -->
      <div *ngIf="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div *ngFor="let i of [1,2,3,4,5,6]" class="card"><div class="skeleton h-40 rounded-xl"></div></div>
      </div>

      <div *ngIf="!loading && filteredJobs.length === 0" class="card text-center py-16">
        <svg class="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
        <h3 class="text-lg font-semibold text-slate-400 mb-2">No jobs found</h3>
        <p class="text-slate-500 text-sm mb-4">Get started by creating your first job posting</p>
        <a routerLink="/jobs/create" class="btn-primary">Create Job</a>
      </div>

      <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div *ngFor="let job of filteredJobs" class="card-hover group">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-semibold text-white truncate">{{ job.title }}</h3>
              <p class="text-sm text-slate-400 mt-0.5">{{ job.location || 'Remote' }}</p>
            </div>
            <span [class]="getStatusBadge(job.status)">{{ job.status }}</span>
          </div>

          <p class="text-sm text-slate-400 line-clamp-2 mb-4">{{ job.description }}</p>

          <div class="flex flex-wrap gap-1.5 mb-4">
            <span *ngFor="let skill of (job.skills || []).slice(0, 3)" class="badge badge-purple">{{ skill }}</span>
            <span *ngIf="(job.skills || []).length > 3" class="badge badge-slate">+{{ job.skills.length - 3 }}</span>
          </div>

          <div class="flex items-center gap-3 text-xs text-slate-500 mb-4">
            <span class="flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              {{ job.type }}
            </span>
            <span *ngIf="job.experience" class="flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {{ job.experience }}+ yrs
            </span>
            <span *ngIf="job.salary?.min" class="flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {{ getSalary(job) }}
            </span>
          </div>

          <div class="flex gap-2 pt-3 border-t border-slate-700/50">
            <a [routerLink]="['/jobs', job._id]" class="btn-secondary btn-sm flex-1 text-center">View</a>
            <a [routerLink]="['/jobs', job._id, 'edit']" class="btn-secondary btn-sm">Edit</a>
            <button *ngIf="job.status === 'Draft'" (click)="publish(job)" class="btn-success btn-sm">Publish</button>
            <button (click)="delete(job._id)" class="btn-danger btn-sm">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class JobsComponent implements OnInit {
  jobs: any[] = [];
  filteredJobs: any[] = [];
  loading = true;
  searchQuery = '';
  statusFilter = '';
  typeFilter = '';
  analytics: any[] = [];

  constructor(private jobService: JobService) {}

  ngOnInit() {
    this.loadJobs();
    this.loadAnalytics();
  }

  loadJobs() {
    this.loading = true;
    this.jobService.getJobs().subscribe({
      next: jobs => { this.jobs = jobs; this.filteredJobs = jobs; this.loading = false; },
      error: () => {
        this.jobs = this.getMockJobs();
        this.filteredJobs = this.jobs;
        this.loading = false;
      }
    });
  }

  loadAnalytics() {
    this.jobService.getJobAnalytics().subscribe({
      next: data => {
        this.analytics = [
          { label: 'Total Jobs', value: data.total, icon: '💼', bg: 'rgba(99,102,241,0.1)' },
          { label: 'Published', value: data.published, icon: '✅', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Draft', value: data.draft, icon: '📝', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Closed', value: data.closed, icon: '🔒', bg: 'rgba(239,68,68,0.1)' },
        ];
      },
      error: () => {
        this.analytics = [
          { label: 'Total Jobs', value: 12, icon: '💼', bg: 'rgba(99,102,241,0.1)' },
          { label: 'Published', value: 8, icon: '✅', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Draft', value: 3, icon: '📝', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Closed', value: 1, icon: '🔒', bg: 'rgba(239,68,68,0.1)' },
        ];
      }
    });
  }

  filterJobs() {
    this.filteredJobs = this.jobs.filter(j => {
      const matchSearch = !this.searchQuery || j.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchStatus = !this.statusFilter || j.status === this.statusFilter;
      const matchType = !this.typeFilter || j.type === this.typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }

  publish(job: any) {
    this.jobService.publishJob(job._id).subscribe({
      next: (updated) => { job.status = 'Published'; },
      error: () => { job.status = 'Published'; } // optimistic for demo
    });
  }

  delete(id: string) {
    if (!confirm('Are you sure you want to delete this job?')) return;
    this.jobService.deleteJob(id).subscribe({
      next: () => { this.jobs = this.jobs.filter(j => j._id !== id); this.filterJobs(); },
      error: () => { this.jobs = this.jobs.filter(j => j._id !== id); this.filterJobs(); }
    });
  }

  getSalary(job: any): string {
    if (!job?.salary?.min) return '';
    const min = Math.round(job.salary.min / 1000);
    const max = Math.round(job.salary.max / 1000);
    return `$${min}k–$${max}k`;
  }

  getStatusBadge(status: string): string {
    const map: any = { Published: 'badge badge-green', Draft: 'badge badge-yellow', Closed: 'badge badge-red' };
    return map[status] || 'badge badge-slate';
  }

  getMockJobs() {
    return [
      { _id: '1', title: 'Senior Frontend Developer', description: 'We are looking for an experienced Angular developer to join our growing team. You will work on cutting-edge projects.', skills: ['Angular', 'TypeScript', 'RxJS', 'Tailwind'], experience: 3, type: 'Full-time', status: 'Published', location: 'New York, NY', salary: { min: 110000, max: 150000 } },
      { _id: '2', title: 'Full Stack Node.js Engineer', description: 'Join our backend team to build scalable REST APIs and microservices using Node.js and TypeScript.', skills: ['Node.js', 'Express', 'MongoDB', 'Docker'], experience: 2, type: 'Full-time', status: 'Published', location: 'San Francisco, CA', salary: { min: 120000, max: 160000 } },
      { _id: '3', title: 'Product Designer (UI/UX)', description: 'Design beautiful and intuitive user interfaces for our AI-powered platform.', skills: ['Figma', 'UI/UX', 'Prototyping'], experience: 2, type: 'Remote', status: 'Draft', location: 'Remote', salary: { min: 90000, max: 120000 } },
      { _id: '4', title: 'DevOps Engineer', description: 'Manage our cloud infrastructure and deployment pipelines on AWS and GCP.', skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'], experience: 4, type: 'Full-time', status: 'Published', location: 'Austin, TX', salary: { min: 130000, max: 170000 } },
      { _id: '5', title: 'AI/ML Engineer', description: 'Build and deploy machine learning models for our candidate screening engine.', skills: ['Python', 'TensorFlow', 'LLMs', 'FastAPI'], experience: 3, type: 'Full-time', status: 'Published', location: 'Remote', salary: { min: 140000, max: 190000 } },
      { _id: '6', title: 'HR Business Partner', description: 'Partner with leadership to align HR strategies with business objectives.', skills: ['HR', 'Recruiting', 'Talent Strategy'], experience: 5, type: 'Full-time', status: 'Closed', location: 'Chicago, IL', salary: { min: 85000, max: 110000 } },
    ];
  }
}
