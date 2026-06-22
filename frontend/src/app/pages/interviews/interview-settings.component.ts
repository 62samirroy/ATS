import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InterviewSettingsService, InterviewSetting } from '../../services/interview-settings.service';

@Component({
  selector: 'app-interview-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in relative">
      <div class="page-header" style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <h1 class="page-title"><i class="fa-solid fa-gear" style="color:var(--primary);margin-right:8px"></i> Interview Settings</h1>
          <p class="page-subtitle">Configure interview statuses and types</p>
        </div>
      </div>

      <div class="card" style="padding:0;overflow:hidden;min-height:500px">
        
        <!-- Tabs -->
        <div style="display:flex;border-bottom:1px solid var(--border);background:var(--surface)">
          <button class="status-tab" [class.active]="activeTab==='status'" (click)="activeTab='status'" style="flex:1;border-radius:0;border:none;padding:1rem;font-weight:600;font-size:0.875rem">
            <i class="fa-solid fa-list-check" style="margin-right:6px"></i> Interview Statuses
          </button>
          <button class="status-tab" [class.active]="activeTab==='type'" (click)="activeTab='type'" style="flex:1;border-radius:0;border:none;padding:1rem;font-weight:600;font-size:0.875rem">
            <i class="fa-solid fa-video" style="margin-right:6px"></i> Interview Types
          </button>
        </div>

        <div style="padding:1.5rem">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
            <h2 class="text-lg font-bold text-brand-text">{{ activeTab === 'status' ? 'Status List' : 'Type List' }}</h2>
            <button class="btn-primary btn-sm" (click)="openModal()">
              <i class="fa-solid fa-plus"></i> Add New {{ activeTab === 'status' ? 'Status' : 'Type' }}
            </button>
          </div>

          <div *ngIf="loading" class="space-y-3">
            <div *ngFor="let i of [1,2,3]" class="skeleton h-12"></div>
          </div>

          <div *ngIf="activeTab==='status'">
            <div *ngIf="!loading && getStatuses().length===0" class="text-center py-8 text-brand-muted">No statuses configured.</div>
            <div *ngIf="!loading && getStatuses().length>0" class="space-y-3">
              <div *ngFor="let item of getStatuses()" class="flex items-center justify-between p-4 bg-brand-bg border border-brand-border rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-4 h-4 rounded-full" [style.background]="item.color || '#CBD5E1'"></div>
                  <span class="font-semibold text-brand-text">{{ item.name }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <button class="btn-icon btn-icon-primary" (click)="openModal(item)"><i class="fa-solid fa-pen"></i></button>
                  <button class="btn-icon btn-icon-danger" (click)="confirmDelete(item)"><i class="fa-solid fa-trash"></i></button>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="activeTab==='type'">
            <div *ngIf="!loading && getTypes().length===0" class="text-center py-8 text-brand-muted">No types configured.</div>
            <div *ngIf="!loading && getTypes().length>0" class="space-y-3">
              <div *ngFor="let item of getTypes()" class="flex items-center justify-between p-4 bg-brand-bg border border-brand-border rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-4 h-4 rounded-full" [style.background]="item.color || '#CBD5E1'"></div>
                  <span class="font-semibold text-brand-text">{{ item.name }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <button class="btn-icon btn-icon-primary" (click)="openModal(item)"><i class="fa-solid fa-pen"></i></button>
                  <button class="btn-icon btn-icon-danger" (click)="confirmDelete(item)"><i class="fa-solid fa-trash"></i></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ADD/EDIT MODAL -->
    <div *ngIf="showModal" class="modal-overlay" (click)="showModal=false">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <h3 class="text-lg font-bold mb-4">{{ isEdit ? 'Edit' : 'Add' }} {{ activeTab === 'status' ? 'Status' : 'Type' }}</h3>
        
        <div class="space-y-4">
          <div class="form-group">
            <label class="form-label">Name *</label>
            <input type="text" class="form-input" [(ngModel)]="currentSetting.name" placeholder="e.g. Scheduled, Video, Technical...">
          </div>
          
          <div class="form-group">
            <label class="form-label">Color Label</label>
            <div class="flex items-center gap-3">
              <input type="color" class="h-10 w-14 rounded cursor-pointer" [(ngModel)]="currentSetting.color">
              <span class="text-brand-muted text-sm">{{ currentSetting.color }}</span>
            </div>
          </div>
          
          <div class="flex gap-3 mt-6">
            <button class="btn-primary flex-1" (click)="saveSetting()" [disabled]="!currentSetting.name">
              {{ isEdit ? 'Update' : 'Save' }}
            </button>
            <button class="btn-secondary" (click)="showModal=false">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- DELETE MODAL -->
    <div *ngIf="showDeleteModal" class="modal-overlay" (click)="showDeleteModal=false">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <h3 class="text-lg font-bold mb-2 text-brand-text">Confirm Delete</h3>
        <p class="text-brand-muted mb-4">Are you sure you want to delete '{{ settingToDelete?.name }}'? This might affect interviews currently using this {{ activeTab }}.</p>
        <div class="flex gap-3">
          <button (click)="executeDelete()" class="btn-danger flex-1" style="background:#DC2626;color:white">Delete</button>
          <button (click)="showDeleteModal=false" class="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  `
})
export class InterviewSettingsComponent implements OnInit {
  activeTab: 'status' | 'type' = 'status';
  settings: InterviewSetting[] = [];
  loading = true;

  showModal = false;
  isEdit = false;
  currentSetting: Partial<InterviewSetting> = { name: '', color: '#3B82F6' };

  showDeleteModal = false;
  settingToDelete: InterviewSetting | null = null;

  constructor(private interviewSettingsService: InterviewSettingsService) {}

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.loading = true;
    this.interviewSettingsService.getSettings().subscribe({
      next: (res) => {
        this.settings = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getStatuses() { return this.settings.filter(s => s.type === 'status'); }
  getTypes() { return this.settings.filter(s => s.type === 'type'); }

  openModal(item?: InterviewSetting) {
    if (item) {
      this.isEdit = true;
      this.currentSetting = { ...item };
    } else {
      this.isEdit = false;
      this.currentSetting = { name: '', type: this.activeTab, color: '#3B82F6' };
    }
    this.showModal = true;
  }

  saveSetting() {
    if (!this.currentSetting.name) return;
    
    if (this.isEdit && this.currentSetting._id) {
      this.interviewSettingsService.updateSetting(this.currentSetting._id, this.currentSetting).subscribe(() => {
        this.showModal = false;
        this.loadSettings();
      });
    } else {
      this.currentSetting.type = this.activeTab;
      this.interviewSettingsService.createSetting(this.currentSetting as InterviewSetting).subscribe(() => {
        this.showModal = false;
        this.loadSettings();
      });
    }
  }

  confirmDelete(item: InterviewSetting) {
    this.settingToDelete = item;
    this.showDeleteModal = true;
  }

  executeDelete() {
    if (this.settingToDelete && this.settingToDelete._id) {
      this.interviewSettingsService.deleteSetting(this.settingToDelete._id).subscribe(() => {
        this.showDeleteModal = false;
        this.settingToDelete = null;
        this.loadSettings();
      });
    }
  }
}
