import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidateService } from '../../services/candidate.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-candidates-recycle-bin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="animate-fade-in relative">
      <div class="page-header" style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <h1 class="page-title"><i class="fa-solid fa-trash-can" style="color:#DC2626;margin-right:8px"></i> Recycle Bin (Candidates)</h1>
          <p class="page-subtitle">Restore deleted candidates or permanently remove them</p>
        </div>
        <a routerLink="/candidates" class="btn-secondary" style="display:inline-flex;align-items:center;gap:6px">
          <i class="fa-solid fa-arrow-left"></i> Back to Candidates
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
                <th>Candidate Name</th>
                <th>Email</th>
                <th>Deleted On</th>
                <th style="text-align:center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="deletedCandidates.length === 0">
                <td colspan="4" style="text-align:center;padding:3rem;color:var(--muted)">Recycle bin is empty.</td>
              </tr>
              <tr *ngFor="let c of deletedCandidates">
                <td>
                  <div style="font-weight:600;color:var(--text)">{{ c.name }}</div>
                  <div style="font-size:0.75rem;color:var(--muted)">{{ c.experience }} yrs experience</div>
                </td>
                <td>{{ c.email }}</td>
                <td>{{ c.updatedAt | date:'mediumDate' }}</td>
                <td>
                  <div style="display:flex;align-items:center;justify-content:center;gap:6px">
                    <button class="btn-primary" title="Restore Candidate" (click)="restoreCandidate(c._id)" style="padding:4px 8px;font-size:0.75rem">
                      <i class="fa-solid fa-rotate-left"></i> Restore
                    </button>
                    <button class="btn-icon btn-icon-danger" title="Permanently Delete" (click)="confirmPermanentDelete(c)">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination-bar" *ngIf="!loading">
          <span class="pagination-info">Showing {{ deletedCandidates.length }} rows</span>
        </div>
      </div>
    </div>

    <!-- Permanent Delete Confirmation Modal -->
    <div *ngIf="showDeleteModal" class="modal-overlay" (click)="showDeleteModal=false">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <h3 class="text-lg font-bold mb-2 text-brand-text">Permanent Delete</h3>
        <p class="text-brand-muted mb-4">Are you sure you want to permanently delete '{{ candidateToDelete?.name }}'? This action cannot be undone.</p>
        <div class="flex gap-3">
          <button (click)="permanentDelete()" class="btn-danger flex-1" style="background:#DC2626;color:white">Delete Permanently</button>
          <button (click)="showDeleteModal=false" class="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  `
})
export class CandidatesRecycleBinComponent implements OnInit {
  deletedCandidates: any[] = [];
  loading = true;
  
  showDeleteModal = false;
  candidateToDelete: any = null;

  constructor(private candidateService: CandidateService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.candidateService.getDeletedCandidates().subscribe({
      next: (candidates) => {
        this.deletedCandidates = candidates;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  restoreCandidate(id: string) {
    this.candidateService.restoreCandidate(id).subscribe(() => {
      this.loadData();
    });
  }

  confirmPermanentDelete(c: any) {
    this.candidateToDelete = c;
    this.showDeleteModal = true;
  }

  permanentDelete() {
    if (this.candidateToDelete) {
      this.candidateService.permanentDeleteCandidate(this.candidateToDelete._id).subscribe(() => {
        this.showDeleteModal = false;
        this.candidateToDelete = null;
        this.loadData();
      });
    }
  }
}
