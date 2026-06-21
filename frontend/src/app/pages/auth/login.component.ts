import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-dark-950 p-4">
      <!-- Background decorations -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl"></div>
        <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/5 rounded-full blur-3xl"></div>
      </div>

      <div class="w-full max-w-md relative z-10">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-600/20 rounded-2xl mb-4 glow">
            <svg class="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gradient">HireFlow AI</h1>
          <p class="text-slate-400 mt-2">Sign in to your account</p>
        </div>

        <!-- Card -->
        <div class="card border border-slate-700/80">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <!-- Error message -->
            <div *ngIf="error" class="px-4 py-3 bg-red-900/30 border border-red-600/30 rounded-xl text-red-400 text-sm flex items-center gap-2 animate-fade-in">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {{ error }}
            </div>

            <!-- Email -->
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input id="login-email" type="email" formControlName="email" class="form-input" placeholder="you@example.com" autocomplete="email">
              <span *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="text-xs text-red-400 mt-1">Valid email is required</span>
            </div>

            <!-- Password -->
            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="relative">
                <input id="login-password" [type]="showPwd ? 'text' : 'password'" formControlName="password" class="form-input pr-12" placeholder="••••••••" autocomplete="current-password">
                <button type="button" (click)="showPwd=!showPwd" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path *ngIf="!showPwd" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    <path *ngIf="showPwd" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                </button>
              </div>
              <span *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="text-xs text-red-400 mt-1">Password is required</span>
            </div>

            <!-- Demo accounts -->
            <div class="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <p class="text-xs text-slate-400 mb-2 font-medium">🚀 Demo Accounts (click to fill):</p>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <button type="button" (click)="fillDemo('admin')" class="px-2 py-1.5 bg-primary-600/20 text-primary-400 rounded-lg border border-primary-500/20 hover:bg-primary-600/30 transition-colors text-left">
                  <span class="font-semibold">Super Admin</span><br>admin&#64;hireflow.ai
                </button>
                <button type="button" (click)="fillDemo('hr')" class="px-2 py-1.5 bg-emerald-600/20 text-emerald-400 rounded-lg border border-emerald-500/20 hover:bg-emerald-600/30 transition-colors text-left">
                  <span class="font-semibold">HR Manager</span><br>hr&#64;hireflow.ai
                </button>
                <button type="button" (click)="fillDemo('interviewer')" class="px-2 py-1.5 bg-amber-600/20 text-amber-400 rounded-lg border border-amber-500/20 hover:bg-amber-600/30 transition-colors text-left">
                  <span class="font-semibold">Interviewer</span><br>interviewer&#64;hireflow.ai
                </button>
                <button type="button" (click)="fillDemo('candidate')" class="px-2 py-1.5 bg-violet-600/20 text-violet-400 rounded-lg border border-violet-500/20 hover:bg-violet-600/30 transition-colors text-left">
                  <span class="font-semibold">Candidate</span><br>candidate&#64;example.com
                </button>
              </div>
            </div>

            <!-- Submit -->
            <button id="login-submit" type="submit" class="btn-primary w-full py-3" [disabled]="loading || loginForm.invalid">
              <span *ngIf="!loading">Sign In</span>
              <span *ngIf="loading" class="flex items-center gap-2">
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Signing in...
              </span>
            </button>

            <p class="text-center text-slate-400 text-sm">
              Don't have an account?
              <a routerLink="/register" class="text-primary-400 hover:text-primary-300 font-semibold transition-colors ml-1">Create one</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';
  showPwd = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  fillDemo(role: string) {
    const demos: any = {
      admin: { email: 'admin@hireflow.ai', password: 'Admin@12345' },
      hr: { email: 'hr@hireflow.ai', password: 'Hr@12345' },
      interviewer: { email: 'interviewer@hireflow.ai', password: 'Int@12345' },
      candidate: { email: 'candidate@example.com', password: 'Cand@12345' },
    };
    this.loginForm.patchValue(demos[role]);
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.loading = true; this.error = '';
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: (user) => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Login failed. Please check your credentials.';
      }
    });
  }
}
