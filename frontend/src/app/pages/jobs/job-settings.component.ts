import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobSettingsService, JobSetting } from '../../services/job-settings.service';

@Component({
  selector: 'app-job-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in relative">
      <div class="page-header">
        <div>
          <h1 class="page-title">Job Settings <span class="badge badge-red" style="vertical-align:middle;margin-left:6px">Super Admin</span></h1>
          <p class="page-subtitle">Configure job statuses, types, and other module preferences</p>
        </div>
      </div>

      <!-- Main card with tabs inside -->
      <div class="card" style="padding:0;overflow:hidden">
        <!-- Tab Bar -->
        <div style="display:flex;border-bottom:1px solid var(--border);padding:0 1rem;overflow-x:auto" class="no-scrollbar">
          <button *ngFor="let tab of tabs" (click)="activeTab=tab.id; loadData()"
            style="display:flex;align-items:center;gap:0.375rem;padding:0.75rem 1rem;font-size:0.8125rem;font-weight:600;border:none;background:none;cursor:pointer;white-space:nowrap;border-bottom:2px solid transparent;transition:all 0.15s;margin-bottom:-1px"
            [style.color]="activeTab===tab.id?'var(--primary)':'var(--muted)'"
            [style.border-bottom-color]="activeTab===tab.id?'var(--primary)':'transparent'">
            <i [class]="tab.icon" style="font-size:0.75rem"></i>{{ tab.label }}
          </button>
        </div>

        <!-- ======== STATUSES TAB ======== -->
        <div *ngIf="activeTab==='status'">
          <div class="filter-bar">
            <div class="search-wrap" style="flex:1;min-width:200px;max-width:320px">
              <svg class="search-icon-inner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input type="text" [(ngModel)]="statusSearch" placeholder="Search statuses...">
            </div>
            <div style="margin-left:auto">
              <button class="btn-primary" (click)="openAddModal('status')">
                <i class="fa-solid fa-plus" style="font-size:0.75rem"></i> Add Status
              </button>
            </div>
          </div>
          
          <div *ngIf="loading" style="padding:1.5rem">
            <div *ngFor="let i of [1,2,3]" class="skeleton" style="height:48px;margin-bottom:6px"></div>
          </div>

          <div *ngIf="!loading" class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th style="width:36px"><input type="checkbox" style="width:14px;height:14px;accent-color:var(--primary)"></th>
                  <th>Status Name</th>
                  <th style="text-align:center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="filteredStatuses.length === 0">
                  <td colspan="3" style="text-align:center;padding:2rem;color:var(--muted)">No statuses found.</td>
                </tr>
                <tr *ngFor="let status of filteredStatuses">
                  <td><input type="checkbox" style="width:14px;height:14px;accent-color:var(--primary)"></td>
                  <td><span class="badge badge-blue">{{ status.name }}</span></td>
                  <td>
                    <div style="display:flex;align-items:center;justify-content:center;gap:4px">
                      <button class="btn-icon btn-icon-primary" title="Edit" (click)="openEditModal(status)"><i class="fa-regular fa-pen-to-square"></i></button>
                      <button class="btn-icon btn-icon-danger" title="Delete" (click)="deleteSetting(status)"><i class="fa-regular fa-trash-can"></i></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pagination-bar" *ngIf="!loading">
            <span class="pagination-info">Showing {{ filteredStatuses.length }} rows</span>
          </div>
        </div>

        <!-- ======== TYPES TAB ======== -->
        <div *ngIf="activeTab==='jobType'">
          <div class="filter-bar">
            <div class="search-wrap" style="flex:1;min-width:200px;max-width:320px">
              <svg class="search-icon-inner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input type="text" [(ngModel)]="typeSearch" placeholder="Search types...">
            </div>
            <div style="margin-left:auto">
              <button class="btn-primary" (click)="openAddModal('jobType')">
                <i class="fa-solid fa-plus" style="font-size:0.75rem"></i> Add Type
              </button>
            </div>
          </div>
          
          <div *ngIf="loading" style="padding:1.5rem">
            <div *ngFor="let i of [1,2,3]" class="skeleton" style="height:48px;margin-bottom:6px"></div>
          </div>

          <div *ngIf="!loading" class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th style="width:36px"><input type="checkbox" style="width:14px;height:14px;accent-color:var(--primary)"></th>
                  <th>Job Type</th>
                  <th style="text-align:center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="filteredTypes.length === 0">
                  <td colspan="3" style="text-align:center;padding:2rem;color:var(--muted)">No job types found.</td>
                </tr>
                <tr *ngFor="let type of filteredTypes">
                  <td><input type="checkbox" style="width:14px;height:14px;accent-color:var(--primary)"></td>
                  <td><span class="badge badge-purple">{{ type.name }}</span></td>
                  <td>
                    <div style="display:flex;align-items:center;justify-content:center;gap:4px">
                      <button class="btn-icon btn-icon-primary" title="Edit" (click)="openEditModal(type)"><i class="fa-regular fa-pen-to-square"></i></button>
                      <button class="btn-icon btn-icon-danger" title="Delete" (click)="deleteSetting(type)"><i class="fa-regular fa-trash-can"></i></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pagination-bar" *ngIf="!loading">
            <span class="pagination-info">Showing {{ filteredTypes.length }} rows</span>
          </div>
        </div>

      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div *ngIf="showModal" class="modal-overlay" (click)="showModal=false">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <h3 class="text-lg font-bold mb-4">{{ isEditing ? 'Edit' : 'Add' }} {{ activeTab === 'status' ? 'Status' : 'Job Type' }}</h3>
        <div class="space-y-4">
          <div class="form-group">
            <label class="form-label">Name *</label>
            <input type="text" [(ngModel)]="currentSetting.name" class="form-input" placeholder="e.g. Published">
          </div>
          <div class="flex gap-3">
            <button (click)="saveSetting()" class="btn-primary flex-1" [disabled]="!currentSetting.name">Save</button>
            <button (click)="showModal=false" class="btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class JobSettingsComponent implements OnInit {
  activeTab: 'status' | 'jobType' = 'status';
  statusSearch = '';
  typeSearch = '';

  tabs = [
    { id: 'status', label: 'Statuses', icon: 'fa-solid fa-list-check' },
    { id: 'jobType', label: 'Job Types', icon: 'fa-solid fa-briefcase' }
  ] as const;

  settings: JobSetting[] = [];
  loading = false;
  
  showModal = false;
  isEditing = false;
  currentSetting: Partial<JobSetting> = {};

  constructor(private jobSettingsService: JobSettingsService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.jobSettingsService.getSettings(this.activeTab).subscribe({
      next: (data) => {
        this.settings = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  get filteredStatuses() {
    if (!this.statusSearch) return this.settings;
    return this.settings.filter(s => s.name.toLowerCase().includes(this.statusSearch.toLowerCase()));
  }

  get filteredTypes() {
    if (!this.typeSearch) return this.settings;
    return this.settings.filter(t => t.name.toLowerCase().includes(this.typeSearch.toLowerCase()));
  }

  openAddModal(type: 'status' | 'jobType') {
    this.isEditing = false;
    this.currentSetting = { type, name: '' };
    this.showModal = true;
  }

  openEditModal(setting: JobSetting) {
    this.isEditing = true;
    this.currentSetting = { ...setting };
    this.showModal = true;
  }

  saveSetting() {
    if (this.isEditing && this.currentSetting._id) {
      this.jobSettingsService.updateSetting(this.currentSetting._id, this.currentSetting).subscribe(() => {
        this.showModal = false;
        this.loadData();
      });
    } else {
      this.jobSettingsService.createSetting(this.currentSetting as JobSetting).subscribe(() => {
        this.showModal = false;
        this.loadData();
      });
    }
  }

  deleteSetting(setting: JobSetting) {
    if (confirm(`Are you sure you want to delete '${setting.name}'?`)) {
      this.jobSettingsService.deleteSetting(setting._id!).subscribe(() => {
        this.loadData();
      });
    }
  }
}
