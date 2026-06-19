import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto animate-fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ isEdit ? 'Edit Job' : 'Create Job Posting' }}</h1>
          <p class="page-subtitle">{{ isEdit ? 'Update job details' : 'Fill in the details to create a new job opening' }}</p>
        </div>
        <a routerLink="/jobs" class="btn-secondary">← Back</a>
      </div>

      <div class="card">
        <form [formGroup]="jobForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Basic Info -->
          <div>
            <h3 class="text-sm font-semibold text-slate-300 mb-4 pb-2 border-b border-slate-700/50">Basic Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="form-group md:col-span-2">
                <label class="form-label">Job Title *</label>
                <input id="job-title" type="text" formControlName="title" class="form-input" placeholder="e.g. Senior Frontend Developer">
              </div>
              <div class="form-group">
                <label class="form-label">Job Type *</label>
                <select id="job-type" formControlName="type" class="form-select">
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Location</label>
                <input id="job-location" type="text" formControlName="location" class="form-input" placeholder="e.g. New York, NY or Remote">
              </div>
              <div class="form-group">
                <label class="form-label">Years of Experience</label>
                <input id="job-exp" type="number" formControlName="experience" class="form-input" placeholder="e.g. 3" min="0">
              </div>
              <div class="form-group">
                <label class="form-label">Status</label>
                <select id="job-status" formControlName="status" class="form-select">
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Salary -->
          <div>
            <h3 class="text-sm font-semibold text-slate-300 mb-4 pb-2 border-b border-slate-700/50">Salary Range</h3>
            <div formGroupName="salary" class="grid grid-cols-3 gap-4">
              <div class="form-group">
                <label class="form-label">Min Salary</label>
                <input id="job-sal-min" type="number" formControlName="min" class="form-input" placeholder="80000">
              </div>
              <div class="form-group">
                <label class="form-label">Max Salary</label>
                <input id="job-sal-max" type="number" formControlName="max" class="form-input" placeholder="120000">
              </div>
              <div class="form-group">
                <label class="form-label">Currency</label>
                <select formControlName="currency" class="form-select">
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Skills -->
          <div>
            <h3 class="text-sm font-semibold text-slate-300 mb-4 pb-2 border-b border-slate-700/50">Required Skills</h3>
            <div class="flex gap-2 mb-3">
              <input id="skill-input" type="text" [(ngModel)]="newSkill" [ngModelOptions]="{standalone: true}" class="form-input flex-1" placeholder="e.g. React, TypeScript..." (keydown.enter)="addSkill($event)">
              <button type="button" (click)="addSkill()" class="btn-primary btn-sm">Add</button>
            </div>
            <div class="flex flex-wrap gap-2">
              <span *ngFor="let skill of skills.controls; let i = index" class="badge badge-purple flex items-center gap-1.5">
                {{ skill.value }}
                <button type="button" (click)="removeSkill(i)" class="hover:text-red-400 transition-colors">×</button>
              </span>
            </div>
          </div>

          <!-- Description -->
          <div>
            <h3 class="text-sm font-semibold text-slate-300 mb-4 pb-2 border-b border-slate-700/50">Job Description</h3>
            <div class="form-group">
              <label class="form-label">Description *</label>
              <textarea id="job-desc" formControlName="description" class="form-textarea h-40" placeholder="Describe the role, responsibilities, requirements..."></textarea>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-4 border-t border-slate-700/50">
            <button id="job-submit" type="submit" class="btn-primary" [disabled]="loading || jobForm.invalid">
              <span *ngIf="!loading">{{ isEdit ? 'Update Job' : 'Create Job' }}</span>
              <span *ngIf="loading" class="flex items-center gap-2">
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Saving...
              </span>
            </button>
            <a routerLink="/jobs" class="btn-secondary">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class JobFormComponent implements OnInit {
  jobForm: FormGroup;
  loading = false;
  isEdit = false;
  jobId = '';
  newSkill = '';

  constructor(
    private fb: FormBuilder,
    private jobService: JobService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.jobForm = this.fb.group({
      title: ['', Validators.required],
      type: ['Full-time'],
      location: [''],
      experience: [0],
      status: ['Draft'],
      description: ['', Validators.required],
      companyId: ['default-company'],
      salary: this.fb.group({ min: [0], max: [0], currency: ['USD'] }),
      skills: this.fb.array([])
    });
  }

  get skills() { return this.jobForm.get('skills') as FormArray; }

  ngOnInit() {
    this.jobId = this.route.snapshot.params['id'];
    this.isEdit = !!this.jobId;
    if (this.isEdit) {
      this.jobService.getJobById(this.jobId).subscribe(job => {
        this.jobForm.patchValue(job);
        job.skills?.forEach((s: string) => this.skills.push(this.fb.control(s)));
      });
    }
  }

  addSkill(event?: any) {
    if (event) event.preventDefault();
    if (this.newSkill.trim()) {
      this.skills.push(this.fb.control(this.newSkill.trim()));
      this.newSkill = '';
    }
  }

  removeSkill(index: number) { this.skills.removeAt(index); }

  onSubmit() {
    if (this.jobForm.invalid) return;
    this.loading = true;
    const data = this.jobForm.value;
    const request = this.isEdit ? this.jobService.updateJob(this.jobId, data) : this.jobService.createJob(data);
    request.subscribe({
      next: () => { this.loading = false; this.router.navigate(['/jobs']); },
      error: (err) => { this.loading = false; console.error(err); this.router.navigate(['/jobs']); }
    });
  }
}
