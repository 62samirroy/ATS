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
    <!-- LIST VIEW -->
    <div *ngIf="!activeInterview" class="space-y-6 animate-fade-in">
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

      <!-- Stat Cards -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:0.75rem;margin-bottom:1rem">
        <div class="stat-card" style="padding:0.75rem 0.875rem">
          <div style="display:flex;align-items:center;gap:0.5rem">
            <div style="width:34px;height:34px;background:#EEF6FF;border-radius:8px;display:flex;align-items:center;justify-content:center"><i class="fa-regular fa-calendar" style="color:#1976D2;font-size:0.9rem"></i></div>
            <div><div style="font-size:0.625rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.04em">Total</div><div style="font-size:1.25rem;font-weight:800;color:var(--text);line-height:1.1">{{ interviews.length }}</div></div>
          </div>
        </div>
        <div class="stat-card" style="padding:0.75rem 0.875rem">
          <div style="display:flex;align-items:center;gap:0.5rem">
            <div style="width:34px;height:34px;background:#FFFBEB;border-radius:8px;display:flex;align-items:center;justify-content:center"><i class="fa-regular fa-clock" style="color:#D97706;font-size:0.9rem"></i></div>
            <div><div style="font-size:0.625rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.04em">Scheduled</div><div style="font-size:1.25rem;font-weight:800;color:#D97706;line-height:1.1">{{ countByStatus('Scheduled') }}</div></div>
          </div>
        </div>
        <div class="stat-card" style="padding:0.75rem 0.875rem">
          <div style="display:flex;align-items:center;gap:0.5rem">
            <div style="width:34px;height:34px;background:#F0FDF4;border-radius:8px;display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-circle-check" style="color:#16A34A;font-size:0.9rem"></i></div>
            <div><div style="font-size:0.625rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.04em">Completed</div><div style="font-size:1.25rem;font-weight:800;color:#16A34A;line-height:1.1">{{ countByStatus('Completed') }}</div></div>
          </div>
        </div>
        <div class="stat-card" style="padding:0.75rem 0.875rem">
          <div style="display:flex;align-items:center;gap:0.5rem">
            <div style="width:34px;height:34px;background:#FEF2F2;border-radius:8px;display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-circle-xmark" style="color:#DC2626;font-size:0.9rem"></i></div>
            <div><div style="font-size:0.625rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.04em">Cancelled</div><div style="font-size:1.25rem;font-weight:800;color:#DC2626;line-height:1.1">{{ countByStatus('Cancelled') }}</div></div>
          </div>
        </div>
      </div>

      <!-- Table Card -->
      <div class="card" style="padding:0;overflow:hidden">
        <!-- Filter Bar -->
        <div class="filter-bar">
          <div class="search-wrap" style="flex:1;min-width:200px">
            <svg class="search-icon-inner" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" [(ngModel)]="search" (input)="filter()" placeholder="Search by candidate...">
          </div>
          <select [(ngModel)]="statusFilter" (change)="filter()" class="form-select" style="width:auto;min-width:130px">
            <option value="">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="No Show">No Show</option>
          </select>
          <select [(ngModel)]="typeFilter" (change)="filter()" class="form-select" style="width:auto;min-width:120px">
            <option value="">All Types</option>
            <option value="Video">Video</option>
            <option value="Phone">Phone</option>
            <option value="Technical">Technical</option>
            <option value="In-person">In-person</option>
          </select>
        </div>

        <div *ngIf="loading" style="padding:1.5rem">
          <div *ngFor="let i of [1,2,3,4]" class="skeleton" style="height:48px;margin-bottom:6px"></div>
        </div>

        <div *ngIf="!loading && filteredInterviews.length === 0" style="text-align:center;padding:3rem;color:var(--muted)">
          <i class="fa-regular fa-calendar" style="font-size:2rem;color:var(--border);display:block;margin-bottom:0.75rem"></i>
          <p style="font-size:0.9375rem;font-weight:600;color:var(--text)">No interviews found</p>
        </div>

        <!-- Table -->
        <div *ngIf="!loading && filteredInterviews.length > 0" class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th style="width:36px"><input type="checkbox" style="width:14px;height:14px;accent-color:var(--primary);cursor:pointer"></th>
                <th>Candidate</th>
                <th>Job</th>
                <th>Type</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th>Score</th>
                <th>Result</th>
                <th style="text-align:center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let iv of filteredInterviews">
                <td><input type="checkbox" style="width:14px;height:14px;accent-color:var(--primary);cursor:pointer"></td>
                <td>
                  <div style="display:flex;align-items:center;gap:0.5rem">
                    <div class="avatar" style="width:30px;height:30px;font-size:0.75rem;flex-shrink:0">{{ iv.candidateId?.name?.charAt(0) || '?' }}</div>
                    <div>
                      <p style="font-weight:600;color:var(--text);font-size:0.8125rem;margin:0">{{ iv.candidateId?.name || 'N/A' }}</p>
                      <p style="font-size:0.6875rem;color:var(--muted);margin:0">{{ iv.candidateId?.email }}</p>
                    </div>
                  </div>
                </td>
                <td style="font-size:0.8125rem;color:var(--text);max-width:160px"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ iv.jobId?.title || 'N/A' }}</div></td>
                <td><span class="badge badge-blue">{{ iv.type }}</span></td>
                <td style="font-size:0.75rem;color:var(--muted)">{{ iv.scheduledDate | date:'dd MMM y · HH:mm' }}</td>
                <td><span [class]="getStatusBadge(iv.status)">{{ iv.status }}</span></td>
                <td>
                  <span *ngIf="iv.score" style="font-weight:700;font-size:0.8125rem" [style.color]="iv.score >= 7 ? '#16A34A' : iv.score >= 5 ? '#D97706' : '#DC2626'">{{ iv.score }}/10</span>
                  <span *ngIf="!iv.score" style="color:var(--muted)">—</span>
                </td>
                <td>
                  <span *ngIf="iv.result" [class]="iv.result === 'Pass' ? 'badge badge-green' : iv.result === 'Fail' ? 'badge badge-red' : 'badge badge-yellow'">{{ iv.result }}</span>
                  <span *ngIf="!iv.result" style="color:var(--muted)">—</span>
                </td>
                <td>
                  <div style="display:flex;align-items:center;justify-content:center;gap:4px">
                    <button *ngIf="iv.status === 'Scheduled'" (click)="openFeedback(iv)" class="btn-icon btn-icon-success" title="Submit Feedback">
                      <i class="fa-solid fa-clipboard-check" style="font-size:0.7rem"></i>
                    </button>
                    <button *ngIf="iv.meetingLink || iv.type === 'Video' || iv.type === 'Technical'" (click)="joinMeeting(iv)" class="btn-icon btn-icon-primary" title="Join Meeting Room">
                      <i class="fa-solid fa-video" style="font-size:0.7rem"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div *ngIf="!loading && filteredInterviews.length > 0" class="pagination-bar">
          <span class="pagination-info">Showing 1–{{ filteredInterviews.length }} of {{ filteredInterviews.length }} rows</span>
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

    <!-- ACTIVE INTERVIEW ROOM VIEW -->
    <div *ngIf="activeInterview" class="h-[calc(100vh-8rem)] flex gap-6 animate-fade-in">
      
      <!-- Video Grid Area (Left/Main) -->
      <div class="flex-1 flex flex-col bg-brand-surface rounded-xl border border-brand-border overflow-hidden shadow-sm">
        <div class="p-4 border-b border-brand-border bg-brand-secondary flex justify-between items-center">
          <div class="flex items-center gap-3">
            <button (click)="activeInterview = null" class="w-8 h-8 rounded-full hover:bg-brand-border flex items-center justify-center transition-colors">
              <svg class="w-5 h-5 text-brand-text" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <h2 class="font-bold text-brand-text">{{ activeInterview.candidateId?.name }} - {{ activeInterview.type }} Interview</h2>
          </div>
          <div class="flex gap-2 items-center">
            <span class="w-2 h-2 rounded-full bg-brand-success animate-pulse"></span>
            <span class="badge bg-brand-bg text-brand-text border-brand-border px-3 py-1 font-medium shadow-sm">Recording: 00:15:32</span>
          </div>
        </div>
        
        <div class="flex-1 bg-brand-bg p-4 flex flex-col gap-4">
          <!-- Candidate Video -->
          <div class="flex-1 bg-brand-nav rounded-xl relative overflow-hidden flex items-center justify-center shadow-inner">
            <svg class="w-16 h-16 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            <div class="absolute bottom-4 left-4 bg-black/60 px-3 py-1.5 rounded-lg text-white text-sm font-medium backdrop-blur-sm flex items-center gap-2">
              {{ activeInterview.candidateId?.name }}
              <svg class="w-3.5 h-3.5 text-brand-success" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd"/></svg>
            </div>
          </div>
          
          <!-- Interviewer Video (Picture-in-picture style) -->
          <div class="absolute bottom-28 right-8 w-64 aspect-video bg-brand-nav border-2 border-brand-surface rounded-xl shadow-lg relative overflow-hidden flex items-center justify-center">
            <svg class="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            <div class="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-xs backdrop-blur-sm">You</div>
          </div>
        </div>
        
        <!-- Video Controls -->
        <div class="p-4 border-t border-brand-border bg-brand-surface flex justify-center gap-4 relative">
          <button class="w-12 h-12 rounded-full border border-brand-border bg-brand-surface flex items-center justify-center text-brand-text hover:bg-brand-secondary transition-colors shadow-sm">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
          </button>
          <button class="w-12 h-12 rounded-full border border-brand-border bg-brand-surface flex items-center justify-center text-brand-text hover:bg-brand-secondary transition-colors shadow-sm">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
          </button>
          <button class="w-12 h-12 rounded-full border border-brand-border bg-brand-surface flex items-center justify-center text-brand-text hover:bg-brand-secondary transition-colors shadow-sm">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
          </button>
          <button (click)="activeInterview = null" class="px-6 py-0 h-12 ml-4 rounded-full bg-brand-danger text-white hover:bg-red-700 transition-colors font-medium shadow-sm flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"/></svg>
            End Call
          </button>
        </div>
      </div>

      <!-- Assessment & Notes Panel (Right) -->
      <div class="w-96 bg-brand-surface rounded-xl border border-brand-border flex flex-col shadow-sm">
        <div class="p-4 border-b border-brand-border bg-brand-secondary rounded-t-xl">
          <h3 class="font-bold text-brand-text flex items-center gap-2">
            <svg class="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
            Assessment & Notes
          </h3>
        </div>
        
        <div class="flex-1 overflow-y-auto p-4 space-y-6">
          <!-- Candidate Info -->
          <div>
            <h4 class="text-xs font-bold text-brand-muted mb-3 uppercase tracking-wider">Candidate Profile</h4>
            <div class="flex items-center gap-3 p-3 bg-brand-bg rounded-lg border border-brand-border">
              <div class="w-10 h-10 rounded-full bg-brand-secondary flex items-center justify-center text-brand-primary font-bold shadow-sm">
                {{ activeInterview.candidateId?.name?.charAt(0) || '?' }}
              </div>
              <div>
                <p class="font-medium text-brand-text">{{ activeInterview.candidateId?.name || 'Unknown' }}</p>
                <p class="text-xs text-brand-muted font-medium mt-0.5">{{ activeInterview.jobId?.title || 'General Application' }}</p>
              </div>
            </div>
          </div>
          
          <!-- Live Evaluation -->
          <div>
            <h4 class="text-xs font-bold text-brand-muted mb-3 uppercase tracking-wider">Evaluation Criteria</h4>
            <div class="space-y-4">
              <div class="flex flex-col gap-1.5">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-medium text-brand-text">Technical Skills</label>
                  <span class="text-xs font-bold text-brand-primary">7/10</span>
                </div>
                <input type="range" class="w-full accent-brand-primary" min="1" max="10" value="7">
              </div>
              <div class="flex flex-col gap-1.5">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-medium text-brand-text">Communication</label>
                  <span class="text-xs font-bold text-brand-primary">8/10</span>
                </div>
                <input type="range" class="w-full accent-brand-primary" min="1" max="10" value="8">
              </div>
              <div class="flex flex-col gap-1.5">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-medium text-brand-text">Problem Solving</label>
                  <span class="text-xs font-bold text-brand-primary">6/10</span>
                </div>
                <input type="range" class="w-full accent-brand-primary" min="1" max="10" value="6">
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="flex-1 flex flex-col min-h-[200px]">
            <h4 class="text-xs font-bold text-brand-muted mb-3 uppercase tracking-wider">Interview Notes</h4>
            <textarea class="flex-1 w-full p-3 rounded-lg border border-brand-border bg-brand-bg text-brand-text focus:outline-none focus:border-brand-primary resize-none transition-colors" placeholder="Type your notes here... (Auto-saving)"></textarea>
          </div>
        </div>
        
        <div class="p-4 border-t border-brand-border bg-brand-surface rounded-b-xl">
          <button (click)="submitEvaluationAndEnd()" class="w-full py-2.5 rounded-lg bg-brand-primary text-white font-medium hover:bg-brand-hover transition-colors shadow-sm flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Complete Assessment
          </button>
        </div>
      </div>
    </div>

    <!-- Schedule Modal -->
    <div *ngIf="showScheduleModal" class="modal-overlay" (click)="showScheduleModal=false">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <h3 class="text-lg font-bold mb-4">Schedule Interview</h3>
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
        <h3 class="text-lg font-bold mb-4">Submit Interview Feedback</h3>
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
  
  // Updated states
  selectedInterview: any = null;
  activeInterview: any = null;
  
  newInterview = { candidateId: '', jobId: '', interviewerId: '60d21b4667d0d8992e610c85', applicationId: '60d21b4667d0d8992e610c86', type: 'Video', scheduledDate: '', meetingLink: '' };
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
      error: () => { 
        // Fallback for mock environment
        const mockIv = {
          _id: Math.random().toString(),
          candidateId: this.candidates.find(c => c._id === this.newInterview.candidateId) || { name: 'Unknown Candidate', email: 'unknown@example.com' },
          jobId: this.jobs.find(j => j._id === this.newInterview.jobId) || { title: 'Unknown Job' },
          type: this.newInterview.type,
          status: 'Scheduled',
          scheduledDate: this.newInterview.scheduledDate || new Date().toISOString(),
          meetingLink: this.newInterview.meetingLink
        };
        this.interviews.unshift(mockIv);
        this.filter();
        this.showScheduleModal = false;
      }
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

  joinMeeting(iv: any) { 
    this.activeInterview = iv; 
  }
  
  submitEvaluationAndEnd() {
    if (this.activeInterview) {
      this.openFeedback(this.activeInterview);
      this.activeInterview = null;
    }
  }

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

