import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InterviewService } from '../../services/interview.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-interviews-recycle-bin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="animate-fade-in relative">
      <div class="page-header" style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <h1 class="page-title"><i class="fa-solid fa-trash-can" style="color:#DC2626;margin-right:8px"></i> Recycle Bin (Interviews)</h1>
          <p class="page-subtitle">Restore deleted interviews or permanently remove them</p>
        </div>
        <a routerLink="/interviews" class="btn-secondary" style="display:inline-flex;align-items:center;gap:6px">
          <i class="fa-solid fa-arrow-left"></i> Back to Interviews
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
                <th>Candidate</th>
                <th>Type</th>
                <th>Deleted On</th>
                <th style="text-align:center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="deletedInterviews.length === 0">
                <td colspan="4" style="text-align:center;padding:3rem;color:var(--muted)">Recycle bin is empty.</td>
              </tr>
              <tr *ngFor="let i of deletedInterviews">
                <td>
                  <div style="font-weight:600;color:var(--text)">{{ i.candidateId?.name || 'Unknown Candidate' }}</div>
                  <div style="font-size:0.75rem;color:var(--muted)">{{ i.candidateId?.email }}</div>
                </td>
                <td>{{ i.type }}</td>
                <td>{{ i.updatedAt | date:'mediumDate' }}</td>
                <td>
                  <div style="display:flex;align-items:center;justify-content:center;gap:6px">
                    <button class="btn-primary" title="Restore Interview" (click)="restoreInterview(i._id)" style="padding:4px 8px;font-size:0.75rem">
                      <i class="fa-solid fa-rotate-left"></i> Restore
                    </button>
                    <button class="btn-icon btn-icon-danger" title="Permanently Delete" (click)="confirmPermanentDelete(i)">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination-bar" *ngIf="!loading">
          <span class="pagination-info">Showing {{ deletedInterviews.length }} rows</span>
        </div>
      </div>
    </div>

    <!-- Permanent Delete Confirmation Modal -->
    <div *ngIf="showDeleteModal" class="modal-overlay" (click)="showDeleteModal=false">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <h3 class="text-lg font-bold mb-2 text-brand-text">Permanent Delete</h3>
        <p class="text-brand-muted mb-4">Are you sure you want to permanently delete this interview for '{{ interviewToDelete?.candidateId?.name }}'? This action cannot be undone.</p>
        <div class="flex gap-3">
          <button (click)="permanentDelete()" class="btn-danger flex-1" style="background:#DC2626;color:white">Delete Permanently</button>
          <button (click)="showDeleteModal=false" class="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  `
})
export class InterviewsRecycleBinComponent implements OnInit {
  deletedInterviews: any[] = [];
  loading = true;
  
  showDeleteModal = false;
  interviewToDelete: any = null;

  constructor(private interviewService: InterviewService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.interviewService.getDeletedInterviews().subscribe({
      next: (data) => {
        this.deletedInterviews = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  restoreInterview(id: string) {
    this.interviewService.restoreInterview(id).subscribe(() => {
      this.loadData();
    });
  }

  confirmPermanentDelete(i: any) {
    this.interviewToDelete = i;
    this.showDeleteModal = true;
  }

  permanentDelete() {
    if (this.interviewToDelete) {
      this.interviewService.permanentDeleteInterview(this.interviewToDelete._id).subscribe(() => {
        this.showDeleteModal = false;
        this.interviewToDelete = null;
        this.loadData();
      });
    }
  }
}
