import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in" style="max-width:900px">

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">My Profile</h1>
          <p class="page-subtitle">Manage your account settings</p>
        </div>
      </div>

      <!-- Top Section: Avatar + Name Card -->
      <div class="card" style="padding:1.25rem;display:flex;align-items:center;gap:1.25rem;margin-bottom:1rem">
        <div class="avatar" style="width:64px;height:64px;font-size:1.75rem;flex-shrink:0">{{ getInitial() }}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:1.125rem;font-weight:800;color:var(--text);margin-bottom:2px">{{ user?.name }}</div>
          <div style="font-size:0.8125rem;color:var(--muted);margin-bottom:0.5rem">{{ user?.email }}</div>
          <span class="badge badge-purple">{{ user?.role }}</span>
        </div>
        <button (click)="saveProfile()" class="btn-primary" [disabled]="saving">
          <i [class]="saving?'fa-solid fa-spinner fa-spin':'fa-solid fa-floppy-disk'" style="font-size:0.75rem"></i>
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
        <div *ngIf="saved" class="animate-fade-in" style="font-size:0.8125rem;font-weight:600;color:#16A34A;display:flex;align-items:center;gap:4px">
          <i class="fa-solid fa-check"></i> Saved!
        </div>
      </div>

      <!-- Two columns -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">

        <!-- Personal Information -->
        <div class="card" style="padding:1.25rem">
          <div style="font-size:0.9375rem;font-weight:700;color:var(--text);margin-bottom:1rem;padding-bottom:0.625rem;border-bottom:1px solid var(--border)">
            <i class="fa-solid fa-user" style="color:var(--primary);margin-right:0.375rem;font-size:0.875rem"></i> Personal Information
          </div>
          <div class="form-group" style="margin-bottom:0.875rem">
            <label class="form-label">Full Name</label>
            <input type="text" [(ngModel)]="form.name" class="form-input" placeholder="Your full name">
          </div>
          <div class="form-group" style="margin-bottom:0.875rem">
            <label class="form-label">Email Address</label>
            <input type="email" [(ngModel)]="form.email" class="form-input" placeholder="you@example.com">
          </div>
          <div class="form-group" style="margin-bottom:0.875rem">
            <label class="form-label">Phone Number</label>
            <input type="tel" [(ngModel)]="form.phone" class="form-input" placeholder="+1 234 567 8900">
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label">Role</label>
            <input type="text" [value]="user?.role" class="form-input" style="opacity:0.6;cursor:not-allowed;background:var(--bg)" disabled>
            <p style="font-size:0.6875rem;color:var(--muted);margin-top:4px">Contact administrator to change your role</p>
          </div>
        </div>

        <!-- Security -->
        <div class="card" style="padding:1.25rem">
          <div style="font-size:0.9375rem;font-weight:700;color:var(--text);margin-bottom:1rem;padding-bottom:0.625rem;border-bottom:1px solid var(--border)">
            <i class="fa-solid fa-lock" style="color:var(--primary);margin-right:0.375rem;font-size:0.875rem"></i> Security
          </div>
          <div class="form-group" style="margin-bottom:0.875rem">
            <label class="form-label">Current Password</label>
            <input type="password" [(ngModel)]="pwdForm.current" class="form-input" placeholder="Enter current password">
          </div>
          <div class="form-group" style="margin-bottom:0.875rem">
            <label class="form-label">New Password</label>
            <input type="password" [(ngModel)]="pwdForm.new" class="form-input" placeholder="Enter new password">
          </div>
          <div class="form-group" style="margin-bottom:1rem">
            <label class="form-label">Confirm New Password</label>
            <input type="password" [(ngModel)]="pwdForm.confirm" class="form-input" placeholder="Confirm new password">
          </div>
          <button (click)="changePassword()" class="btn-secondary" style="width:100%;justify-content:center">
            <i class="fa-solid fa-key" style="font-size:0.75rem"></i> Update Password
          </button>
        </div>
      </div>

      <!-- Danger Zone — full width at bottom -->
      <div class="card" style="padding:1.25rem;border:1px solid rgba(220,38,38,0.2);background:#FFFAFA">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem">
          <div>
            <div style="font-size:0.9375rem;font-weight:700;color:#DC2626;margin-bottom:2px">
              <i class="fa-solid fa-triangle-exclamation" style="margin-right:0.375rem;font-size:0.875rem"></i> Danger Zone
            </div>
            <p style="font-size:0.8125rem;color:var(--muted)">Once you delete your account, there is no going back. Please be certain.</p>
          </div>
          <button class="btn-danger" style="flex-shrink:0">
            <i class="fa-solid fa-trash-can" style="font-size:0.75rem"></i> Delete Account
          </button>
        </div>
      </div>

    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  form = { name:'', email:'', phone:'' };
  pwdForm = { current:'', new:'', confirm:'' };
  saving = false;
  saved = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.user = this.authService.currentUser;
    if (this.user) {
      this.form.name  = this.user.name;
      this.form.email = this.user.email;
      this.form.phone = (this.user as any).phone || '';
    }
  }

  getInitial(): string { return (this.user?.name||'U').charAt(0).toUpperCase(); }

  saveProfile() {
    this.saving = true;
    setTimeout(() => { this.saving=false; this.saved=true; setTimeout(()=>this.saved=false, 3000); }, 800);
  }

  changePassword() {
    if (!this.pwdForm.current) { alert('Enter your current password'); return; }
    if (this.pwdForm.new !== this.pwdForm.confirm) { alert('Passwords do not match'); return; }
    alert('Password updated successfully!');
    this.pwdForm = { current:'', new:'', confirm:'' };
  }
}
