import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">Admin Panel <span class="badge badge-red ml-2">Super Admin</span></h1>
          <p class="page-subtitle">Platform management and configuration</p>
        </div>
      </div>

      <!-- Admin Tabs -->
      <div class="flex gap-2 bg-dark-800/50 p-1 rounded-xl border border-slate-700/50 w-fit">
        <button *ngFor="let tab of tabs" (click)="activeTab = tab.id"
                [class]="activeTab === tab.id ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
          {{ tab.label }}
        </button>
      </div>

      <!-- Users Tab -->
      <div *ngIf="activeTab === 'users'" class="card p-0">
        <div class="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h3 class="font-semibold text-white">Platform Users</h3>
          <span class="badge badge-blue">{{ users.length }} total</span>
        </div>
        <div class="table-container">
          <table class="table">
            <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let u of users">
                <td>
                  <div class="flex items-center gap-2">
                    <div class="avatar w-8 h-8 text-xs flex items-center justify-center">{{ u.name.charAt(0) }}</div>
                    <div>
                      <p class="text-sm font-medium text-white">{{ u.name }}</p>
                      <p class="text-xs text-slate-500">{{ u.email }}</p>
                    </div>
                  </div>
                </td>
                <td><span [class]="getRoleBadge(u.role)">{{ u.role }}</span></td>
                <td><span [class]="u.isActive ? 'badge badge-green' : 'badge badge-red'">{{ u.isActive ? 'Active' : 'Inactive' }}</span></td>
                <td class="text-sm text-slate-400">{{ u.createdAt | date:'mediumDate' }}</td>
                <td>
                  <div class="flex gap-1">
                    <button (click)="toggleUser(u)" class="btn-sm" [class]="u.isActive ? 'btn-danger' : 'btn-success'">{{ u.isActive ? 'Deactivate' : 'Activate' }}</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Companies Tab -->
      <div *ngIf="activeTab === 'companies'" class="card">
        <h3 class="font-semibold text-white mb-4">Companies</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div *ngFor="let c of companies" class="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 flex items-start gap-3">
            <div class="w-12 h-12 bg-primary-600/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🏢</div>
            <div class="flex-1">
              <h4 class="font-semibold text-white">{{ c.name }}</h4>
              <p class="text-sm text-slate-400">{{ c.website }}</p>
              <div class="flex gap-2 mt-2">
                <span [class]="getPlanBadge(c.plan)">{{ c.plan }}</span>
                <span class="badge badge-slate">{{ c.users }} users</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Subscriptions Tab -->
      <div *ngIf="activeTab === 'subscriptions'" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div *ngFor="let plan of plans" class="card relative overflow-hidden" [class]="plan.highlighted ? 'border-primary-500/50' : ''">
          <div *ngIf="plan.highlighted" class="absolute top-3 right-3 badge badge-purple">Popular</div>
          <h3 class="text-lg font-bold text-white mb-1">{{ plan.name }}</h3>
          <div class="text-3xl font-black mb-4" [class]="plan.highlighted ? 'text-gradient' : 'text-white'">{{ getPlanPrice(plan) }}<span class="text-sm font-normal text-slate-400">/mo</span></div>
          <ul class="space-y-2 mb-6">
            <li *ngFor="let feature of plan.features" class="flex items-center gap-2 text-sm text-slate-300">
              <svg class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              {{ feature }}
            </li>
          </ul>
          <button [class]="plan.highlighted ? 'btn-primary w-full' : 'btn-secondary w-full'">Manage Plan</button>
        </div>
      </div>

      <!-- AI Settings Tab -->
      <div *ngIf="activeTab === 'ai-settings'" class="card">
        <h3 class="font-semibold text-white mb-4">AI Configuration</h3>
        <div class="space-y-4">
          <div class="form-group">
            <label class="form-label">OpenAI API Key</label>
            <input id="openai-key" type="password" [(ngModel)]="aiConfig.openaiKey" class="form-input" placeholder="sk-...">
          </div>
          <div class="form-group">
            <label class="form-label">Gemini API Key</label>
            <input id="gemini-key" type="password" [(ngModel)]="aiConfig.geminiKey" class="form-input" placeholder="AIza...">
          </div>
          <div class="form-group">
            <label class="form-label">AI Model</label>
            <select [(ngModel)]="aiConfig.model" class="form-select">
              <option value="gpt-4o-mini">GPT-4o Mini (Fast & Economical)</option>
              <option value="gpt-4o">GPT-4o (Best Quality)</option>
              <option value="gemini-pro">Gemini Pro</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Minimum AI Match Score for Auto-Shortlist (%)</label>
            <input type="range" [(ngModel)]="aiConfig.minScore" min="50" max="95" step="5" class="w-full accent-primary-500">
            <div class="flex justify-between text-xs text-slate-500 mt-1"><span>50%</span><span class="font-bold text-primary-400">{{ aiConfig.minScore }}%</span><span>95%</span></div>
          </div>
          <button (click)="saveAiConfig()" class="btn-primary">Save AI Settings</button>
        </div>
      </div>
    </div>
  `
})
export class AdminComponent implements OnInit {
  activeTab = 'users';
  tabs = [
    { id: 'users', label: '👥 Users' },
    { id: 'companies', label: '🏢 Companies' },
    { id: 'subscriptions', label: '💳 Subscriptions' },
    { id: 'ai-settings', label: '🤖 AI Settings' },
  ];

  users = [
    { name: 'Admin User', email: 'admin@hireflow.ai', role: 'Super Admin', isActive: true, createdAt: new Date('2024-01-01') },
    { name: 'Sarah Mitchell', email: 'sarah@company.com', role: 'HR Manager', isActive: true, createdAt: new Date('2024-02-15') },
    { name: 'John Patel', email: 'john@company.com', role: 'HR Manager', isActive: true, createdAt: new Date('2024-03-01') },
    { name: 'Alex Johnson', email: 'alex@example.com', role: 'Candidate', isActive: true, createdAt: new Date('2024-04-10') },
    { name: 'Maria Garcia', email: 'maria@example.com', role: 'Candidate', isActive: false, createdAt: new Date('2024-04-20') },
    { name: 'David Kim', email: 'david@company.com', role: 'Interviewer', isActive: true, createdAt: new Date('2024-05-01') },
  ];

  companies = [
    { name: 'TechCorp Inc.', website: 'techcorp.com', plan: 'Enterprise', users: 25 },
    { name: 'StartupXYZ', website: 'startupxyz.io', plan: 'Pro', users: 8 },
    { name: 'Acme Corp', website: 'acme.com', plan: 'Free', users: 3 },
    { name: 'Innovation Labs', website: 'innovationlabs.ai', plan: 'Enterprise', users: 42 },
  ];

  plans = [
    { name: 'Free', price: 0, highlighted: false, features: ['5 active jobs', '50 candidates', 'Basic AI scoring', 'Email notifications'] },
    { name: 'Pro', price: 99, highlighted: true, features: ['Unlimited jobs', '500 candidates', 'Full AI engine', 'Resume parsing', 'Analytics dashboard', 'Priority support'] },
    { name: 'Enterprise', price: 299, highlighted: false, features: ['Unlimited everything', 'Custom AI models', 'API access', 'SSO/SAML', 'Dedicated support', 'Custom integrations'] },
  ];

  aiConfig = { openaiKey: '', geminiKey: '', model: 'gpt-4o-mini', minScore: 70 };

  ngOnInit() {}

  toggleUser(u: any) { u.isActive = !u.isActive; }

  getPlanPrice(plan: any): string { return plan.price === 0 ? 'Free' : '$' + plan.price; }

  getRoleBadge(role: string): string {
    const m: any = { 'Super Admin': 'badge badge-red', 'HR Manager': 'badge badge-purple', 'Interviewer': 'badge badge-blue', 'Candidate': 'badge badge-slate' };
    return m[role] || 'badge badge-slate';
  }

  getPlanBadge(plan: string): string {
    const m: any = { Enterprise: 'badge badge-purple', Pro: 'badge badge-blue', Free: 'badge badge-slate' };
    return m[plan] || 'badge badge-slate';
  }

  saveAiConfig() { alert('AI settings saved successfully!'); }
}
