import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobService } from '../../services/job.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-jobs-recycle-bin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="animate-fade-in relative">
      <div class="page-header" style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <h1 class="page-title"><i class="fa-solid fa-trash-can" style="color:#DC2626;margin-right:8px"></i> Recycle Bin (Jobs)</h1>
          <p class="page-subtitle">Restore deleted jobs or permanently remove them</p>
        </div>
        <a routerLink="/jobs" class="btn-secondary" style="display:inline-flex;align-items:center;gap:6px">
          <i class="fa-solid fa-arrow-left"></i> Back to Jobs
        </a>
      </div>

      <div class="card" style="padding:0;overflow:hidden">
        <div *ngIf="loading" style="padding:1.5rem">
          <div *ngFor="let i of [1,2,3]" class="skeleton" style="height:48px;margin-bottom:6px"></div>
        </div>

        <div *ngIf="!loading" class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Deleted On</th>
                <th style="text-align:center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="deletedJobs.length === 0">
                <td colspan="4" style="text-align:center;padding:3rem;color:var(--muted)">Recycle bin is empty.</td>
              </tr>
              <tr *ngFor="let job of deletedJobs">
                <td>
                  <div style="font-weight:600;color:var(--text)">{{ job.title }}</div>
                  <div style="font-size:0.75rem;color:var(--muted)">{{ job.type }}</div>
                </td>
                <td>{{ job.companyId?.name || 'N/A' }}</td>
                <td>{{ job.updatedAt | date:'mediumDate' }}</td>
                <td>
                  <div style="display:flex;align-items:center;justify-content:center;gap:6px">
                    <button class="btn-primary" title="Restore Job" (click)="restoreJob(job._id)" style="padding:4px 8px;font-size:0.75rem">
                      <i class="fa-solid fa-rotate-left"></i> Restore
                    </button>
                    <button class="btn-icon btn-icon-danger" title="Permanently Delete" (click)="confirmPermanentDelete(job)">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination-bar" *ngIf="!loading">
          <span class="pagination-info">Showing {{ deletedJobs.length }} rows</span>
        </div>
      </div>
    </div>

    <!-- Permanent Delete Confirmation Modal -->
    <div *ngIf="showDeleteModal" class="modal-overlay" (click)="showDeleteModal=false">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <h3 class="text-lg font-bold mb-2 text-brand-text">Permanent Delete</h3>
        <p class="text-brand-muted mb-4">Are you sure you want to permanently delete '{{ jobToDelete?.title }}'? This action cannot be undone.</p>
        <div class="flex gap-3">
          <button (click)="permanentDelete()" class="btn-danger flex-1" style="background:#DC2626;color:white">Delete Permanently</button>
          <button (click)="showDeleteModal=false" class="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  `
})
export class JobsRecycleBinComponent implements OnInit {
  deletedJobs: any[] = [];
  loading = true;
  
  showDeleteModal = false;
  jobToDelete: any = null;

  constructor(private jobService: JobService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.jobService.getDeletedJobs().subscribe({
      next: (jobs) => {
        this.deletedJobs = jobs;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  restoreJob(id: string) {
    this.jobService.restoreJob(id).subscribe(() => {
      this.loadData();
    });
  }

  confirmPermanentDelete(job: any) {
    this.jobToDelete = job;
    this.showDeleteModal = true;
  }

  permanentDelete() {
    if (this.jobToDelete) {
      this.jobService.permanentDeleteJob(this.jobToDelete._id).subscribe(() => {
        this.showDeleteModal = false;
        this.jobToDelete = null;
        this.loadData();
      });
    }
  }
}
