import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InterviewService } from '../../services/interview.service';
import { CandidateService } from '../../services/candidate.service';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-interviews',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">Interview Management</h1>
          <p class="page-subtitle">Schedule, track and manage all interviews</p>
        </div>
        <button (click)="showScheduleModal = true" id="btn-schedule" class="btn-primary">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Schedule Interview
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="stat-card"><p class="text-xs text-slate-400 uppercase tracking-wider">Total</p><p class="text-2xl font-bold text-white">{{ interviews.length }}</p></div>
        <div class="stat-card"><p class="text-xs text-slate-400 uppercase tracking-wider">Scheduled</p><p class="text-2xl font-bold text-primary-400">{{ countByStatus('Scheduled') }}</p></div>
        <div class="stat-card"><p class="text-xs text-slate-400 uppercase tracking-wider">Completed</p><p class="text-2xl font-bold text-emerald-400">{{ countByStatus('Completed') }}</p></div>
        <div class="stat-card"><p class="text-xs text-slate-400 uppercase tracking-wider">Cancelled</p><p class="text-2xl font-bold text-red-400">{{ countByStatus('Cancelled') }}</p></div>
      </div>

      <!-- Filter -->
      <div class="card flex flex-wrap gap-3">
        <div class="search-bar flex-1 min-w-48">
          <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input type="text" [(ngModel)]="search" (input)="filter()" class="search-input" placeholder="Search by candidate...">
        </div>
        <select [(ngModel)]="statusFilter" (change)="filter()" class="form-select w-40">
          <option value="">All Status</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="No Show">No Show</option>
        </select>
        <select [(ngModel)]="typeFilter" (change)="filter()" class="form-select w-36">
          <option value="">All Types</option>
          <option value="Video">Video</option>
          <option value="Phone">Phone</option>
          <option value="Technical">Technical</option>
          <option value="In-person">In-person</option>
        </select>
      </div>

      <!-- Table -->
      <div class="card p-0">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Job</th>
                <th>Type</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th>Score</th>
                <th>Result</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="loading"><td colspan="8" class="text-center py-8 text-slate-500"><svg class="animate-spin w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></td></tr>
              <tr *ngIf="!loading && filteredInterviews.length === 0"><td colspan="8" class="text-center py-8 text-slate-500">No interviews found</td></tr>
              <tr *ngFor="let iv of filteredInterviews">
                <td>
                  <div class="flex items-center gap-2">
                    <div class="avatar w-8 h-8 text-xs flex-shrink-0 flex items-center justify-center">{{ iv.candidateId?.name?.charAt(0) || '?' }}</div>
                    <div>
                      <p class="font-medium text-white text-sm">{{ iv.candidateId?.name || 'N/A' }}</p>
                      <p class="text-xs text-slate-500">{{ iv.candidateId?.email }}</p>
                    </div>
                  </div>
                </td>
                <td><span class="text-sm text-slate-300">{{ iv.jobId?.title || 'N/A' }}</span></td>
                <td><span class="badge badge-blue">{{ iv.type }}</span></td>
                <td class="text-sm text-slate-300">{{ iv.scheduledDate | date:'MMM d, y HH:mm' }}</td>
                <td><span [class]="getStatusBadge(iv.status)">{{ iv.status }}</span></td>
                <td>
                  <span *ngIf="iv.score" class="font-semibold" [class]="iv.score >= 7 ? 'text-emerald-400' : iv.score >= 5 ? 'text-amber-400' : 'text-red-400'">{{ iv.score }}/10</span>
                  <span *ngIf="!iv.score" class="text-slate-600">—</span>
                </td>
                <td>
                  <span *ngIf="iv.result" [class]="iv.result === 'Pass' ? 'badge badge-green' : iv.result === 'Fail' ? 'badge badge-red' : 'badge badge-yellow'">{{ iv.result }}</span>
                  <span *ngIf="!iv.result" class="text-slate-600">—</span>
                </td>
                <td>
                  <div class="flex gap-1">
                    <button *ngIf="iv.status === 'Scheduled'" (click)="openFeedback(iv)" class="btn-success btn-sm">Feedback</button>
                    <button *ngIf="iv.meetingLink" (click)="joinMeeting(iv.meetingLink)" class="btn-primary btn-sm">Join</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Schedule Modal -->
    <div *ngIf="showScheduleModal" class="modal-overlay" (click)="showScheduleModal=false">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <h3 class="text-lg font-bold text-white mb-4">Schedule Interview</h3>
        <div class="space-y-4">
          <div class="form-group">
            <label class="form-label">Candidate</label>
            <select [(ngModel)]="newInterview.candidateId" class="form-select">
              <option value="">Select candidate</option>
              <option *ngFor="let c of candidates" [value]="c._id">{{ c.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Job Position</label>
            <select [(ngModel)]="newInterview.jobId" class="form-select">
              <option value="">Select job</option>
              <option *ngFor="let j of jobs" [value]="j._id">{{ j.title }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Interview Type</label>
            <select [(ngModel)]="newInterview.type" class="form-select">
              <option value="Video">Video</option>
              <option value="Phone">Phone</option>
              <option value="Technical">Technical</option>
              <option value="In-person">In-person</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Date & Time</label>
            <input type="datetime-local" [(ngModel)]="newInterview.scheduledDate" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">Meeting Link (optional)</label>
            <input type="url" [(ngModel)]="newInterview.meetingLink" class="form-input" placeholder="https://meet.google.com/...">
          </div>
          <div class="flex gap-3">
            <button (click)="scheduleInterview()" class="btn-primary flex-1">Schedule</button>
            <button (click)="showScheduleModal=false" class="btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Feedback Modal -->
    <div *ngIf="showFeedbackModal" class="modal-overlay" (click)="showFeedbackModal=false">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <h3 class="text-lg font-bold text-white mb-4">Submit Interview Feedback</h3>
        <div class="space-y-4">
          <div class="form-group">
            <label class="form-label">Score (0-10)</label>
            <input type="number" [(ngModel)]="feedbackData.score" class="form-input" min="0" max="10">
          </div>
          <div class="form-group">
            <label class="form-label">Result</label>
            <select [(ngModel)]="feedbackData.result" class="form-select">
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
              <option value="Hold">Hold</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Feedback Notes</label>
            <textarea [(ngModel)]="feedbackData.feedback" class="form-textarea" placeholder="Share your observations about the candidate..."></textarea>
          </div>
          <div class="flex gap-3">
            <button (click)="submitFeedback()" class="btn-primary flex-1">Submit Feedback</button>
            <button (click)="showFeedbackModal=false" class="btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InterviewsComponent implements OnInit {
  interviews: any[] = [];
  filteredInterviews: any[] = [];
  candidates: any[] = [];
  jobs: any[] = [];
  loading = true;
  search = '';
  statusFilter = '';
  typeFilter = '';
  showScheduleModal = false;
  showFeedbackModal = false;
  selectedInterview: any = null;
  newInterview = { candidateId: '', jobId: '', interviewerId: 'current-user', applicationId: 'default', type: 'Video', scheduledDate: '', meetingLink: '' };
  feedbackData = { score: 7, result: 'Pass', feedback: '' };

  constructor(
    private interviewService: InterviewService,
    private candidateService: CandidateService,
    private jobService: JobService
  ) {}

  ngOnInit() {
    this.loadInterviews();
    this.candidateService.getCandidates().subscribe({ next: c => this.candidates = c, error: () => this.candidates = [] });
    this.jobService.getJobs().subscribe({ next: j => this.jobs = j, error: () => this.jobs = [] });
  }

  loadInterviews() {
    this.interviewService.getInterviews().subscribe({
      next: data => { this.interviews = data; this.filteredInterviews = data; this.loading = false; },
      error: () => { this.interviews = this.getMockInterviews(); this.filteredInterviews = this.interviews; this.loading = false; }
    });
  }

  filter() {
    this.filteredInterviews = this.interviews.filter(iv => {
      const matchSearch = !this.search || (iv.candidateId?.name || '').toLowerCase().includes(this.search.toLowerCase());
      const matchStatus = !this.statusFilter || iv.status === this.statusFilter;
      const matchType = !this.typeFilter || iv.type === this.typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }

  countByStatus(status: string): number {
    return this.interviews.filter(iv => iv.status === status).length;
  }

  scheduleInterview() {
    this.interviewService.scheduleInterview(this.newInterview).subscribe({
      next: iv => { this.interviews.unshift(iv); this.filter(); this.showScheduleModal = false; },
      error: () => { this.showScheduleModal = false; }
    });
  }

  openFeedback(iv: any) { this.selectedInterview = iv; this.showFeedbackModal = true; }

  submitFeedback() {
    if (!this.selectedInterview) return;
    this.interviewService.submitFeedback(this.selectedInterview._id, this.feedbackData).subscribe({
      next: (updated) => {
        const idx = this.interviews.findIndex(iv => iv._id === this.selectedInterview._id);
        if (idx > -1) this.interviews[idx] = { ...this.interviews[idx], ...updated };
        this.filter();
        this.showFeedbackModal = false;
      },
      error: () => {
        const idx = this.interviews.findIndex(iv => iv._id === this.selectedInterview._id);
        if (idx > -1) { this.interviews[idx].status = 'Completed'; this.interviews[idx].score = this.feedbackData.score; this.interviews[idx].result = this.feedbackData.result; }
        this.filter();
        this.showFeedbackModal = false;
      }
    });
  }

  joinMeeting(link: string) { window.open(link, '_blank'); }

  getStatusBadge(s: string): string {
    const m: any = { Scheduled: 'badge badge-blue', Completed: 'badge badge-green', Cancelled: 'badge badge-red', 'No Show': 'badge badge-yellow' };
    return m[s] || 'badge badge-slate';
  }

  getMockInterviews() {
    return [
      { _id: '1', candidateId: { name: 'Alex Johnson', email: 'alex@example.com' }, jobId: { title: 'Senior Frontend Developer' }, type: 'Video', scheduledDate: new Date(Date.now() + 86400000).toISOString(), status: 'Scheduled', meetingLink: 'https://meet.google.com/abc-defg-hij', score: null, result: null },
      { _id: '2', candidateId: { name: 'Maria Garcia', email: 'maria@example.com' }, jobId: { title: 'Full Stack Engineer' }, type: 'Technical', scheduledDate: new Date(Date.now() - 86400000).toISOString(), status: 'Completed', score: 8, result: 'Pass' },
      { _id: '3', candidateId: { name: 'James Wilson', email: 'james@example.com' }, jobId: { title: 'AI/ML Engineer' }, type: 'Phone', scheduledDate: new Date(Date.now() + 3600000).toISOString(), status: 'Scheduled', meetingLink: '', score: null, result: null },
      { _id: '4', candidateId: { name: 'Sophie Chen', email: 'sophie@example.com' }, jobId: { title: 'Product Designer' }, type: 'Video', scheduledDate: new Date(Date.now() - 172800000).toISOString(), status: 'Completed', score: 6, result: 'Hold' },
      { _id: '5', candidateId: { name: 'David Kim', email: 'david@example.com' }, jobId: { title: 'DevOps Engineer' }, type: 'Technical', scheduledDate: new Date(Date.now() - 259200000).toISOString(), status: 'Cancelled', score: null, result: null },
    ];
  }
}
