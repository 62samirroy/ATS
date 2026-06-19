import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">My Profile</h1>
          <p class="page-subtitle">Manage your account settings</p>
        </div>
      </div>

      <!-- Avatar section -->
      <div class="card flex items-center gap-5">
        <div class="avatar w-20 h-20 text-3xl flex items-center justify-center flex-shrink-0">
          {{ getInitial() }}
        </div>
        <div>
          <h2 class="text-xl font-bold text-white">{{ user?.name }}</h2>
          <p class="text-slate-400">{{ user?.email }}</p>
          <span class="badge badge-purple mt-1">{{ user?.role }}</span>
        </div>
      </div>

      <!-- Profile form -->
      <div class="card">
        <h3 class="font-semibold text-white mb-4 pb-2 border-b border-slate-700/50">Personal Information</h3>
        <div class="space-y-4">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input id="profile-name" type="text" [(ngModel)]="form.name" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input id="profile-email" type="email" [(ngModel)]="form.email" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input id="profile-phone" type="tel" [(ngModel)]="form.phone" class="form-input" placeholder="+1 234 567 8900">
          </div>
          <div class="form-group">
            <label class="form-label">Role</label>
            <input type="text" [value]="user?.role" class="form-input opacity-50 cursor-not-allowed" disabled>
            <p class="text-xs text-slate-500 mt-1">Contact admin to change your role</p>
          </div>
          <div class="flex gap-3">
            <button (click)="saveProfile()" id="btn-save-profile" class="btn-primary" [disabled]="saving">
              <span *ngIf="!saving">Save Changes</span>
              <span *ngIf="saving">Saving...</span>
            </button>
            <div *ngIf="saved" class="flex items-center gap-2 text-emerald-400 text-sm animate-fade-in">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              Saved!
            </div>
          </div>
        </div>
      </div>

      <!-- Change Password -->
      <div class="card">
        <h3 class="font-semibold text-white mb-4 pb-2 border-b border-slate-700/50">Security</h3>
        <div class="space-y-4">
          <div class="form-group">
            <label class="form-label">Current Password</label>
            <input id="current-pwd" type="password" [(ngModel)]="pwdForm.current" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">New Password</label>
            <input id="new-pwd" type="password" [(ngModel)]="pwdForm.new" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">Confirm New Password</label>
            <input id="confirm-pwd" type="password" [(ngModel)]="pwdForm.confirm" class="form-input">
          </div>
          <button (click)="changePassword()" class="btn-primary">Update Password</button>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="card border-red-900/30">
        <h3 class="font-semibold text-red-400 mb-2">Danger Zone</h3>
        <p class="text-sm text-slate-400 mb-4">Once you delete your account, there is no going back.</p>
        <button class="btn-danger">Delete Account</button>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  form = { name: '', email: '', phone: '' };
  pwdForm = { current: '', new: '', confirm: '' };
  saving = false;
  saved = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.user = this.authService.currentUser;
    if (this.user) {
      this.form.name = this.user.name;
      this.form.email = this.user.email;
      this.form.phone = this.user.phone || '';
    }
  }

  getInitial(): string {
    return (this.user?.name || 'U').charAt(0).toUpperCase();
  }

  saveProfile() {
    this.saving = true;
    setTimeout(() => { this.saving = false; this.saved = true; setTimeout(() => this.saved = false, 3000); }, 800);
  }

  changePassword() {
    if (this.pwdForm.new !== this.pwdForm.confirm) { alert('Passwords do not match'); return; }
    alert('Password updated successfully!');
    this.pwdForm = { current: '', new: '', confirm: '' };
  }
}
