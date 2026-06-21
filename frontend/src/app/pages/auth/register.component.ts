import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-dark-950 p-4">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl"></div>
        <div class="absolute bottom-1/4 left-1/4 w-80 h-80 bg-primary-600/5 rounded-full blur-3xl"></div>
      </div>

      <div class="w-full max-w-md relative z-10">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-600/20 rounded-2xl mb-4 glow">
            <svg class="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gradient">Join HireFlow AI</h1>
          <p class="text-slate-400 mt-2">Create your free account</p>
        </div>

        <div class="card border border-slate-700/80">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div *ngIf="error" class="px-4 py-3 bg-red-900/30 border border-red-600/30 rounded-xl text-red-400 text-sm animate-fade-in">
              {{ error }}
            </div>

            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input id="reg-name" type="text" formControlName="name" class="form-input" placeholder="John Doe">
            </div>

            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input id="reg-email" type="email" formControlName="email" class="form-input" placeholder="you@example.com">
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <input id="reg-password" type="password" formControlName="password" class="form-input" placeholder="Min 6 characters">
              <span *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" class="text-xs text-red-400">Min 6 characters required</span>
            </div>

            <div class="form-group">
              <label class="form-label">I am a</label>
              <select id="reg-role" formControlName="role" class="form-select">
                <option value="Candidate">Candidate (Job Seeker)</option>
                <option value="HR Manager">HR Manager / Recruiter</option>
                <option value="Interviewer">Interviewer</option>
              </select>
            </div>

            <button id="reg-submit" type="submit" class="btn-primary w-full py-3" [disabled]="loading || registerForm.invalid">
              <span *ngIf="!loading">Create Account</span>
              <span *ngIf="loading" class="flex items-center gap-2">
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Creating account...
              </span>
            </button>

            <p class="text-center text-slate-400 text-sm">
              Already have an account?
              <a routerLink="/login" class="text-primary-400 hover:text-primary-300 font-semibold ml-1">Sign in</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['Candidate']
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;
    this.loading = true; this.error = '';
    this.authService.register(this.registerForm.value).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/dashboard']); },
      error: (err) => { this.loading = false; this.error = err.error?.message || 'Registration failed.'; }
    });
  }
}
