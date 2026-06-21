import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">Admin Panel <span class="badge badge-red" style="vertical-align:middle;margin-left:6px">Super Admin</span></h1>
          <p class="page-subtitle">Platform management and configuration</p>
        </div>
      </div>

      <!-- Main card with tabs inside — same pattern as reference image -->
      <div class="card" style="padding:0;overflow:hidden">

        <!-- Tab Bar — matches reference: Skills | Job Category | Status | Templates | Questions -->
        <div style="display:flex;border-bottom:1px solid var(--border);padding:0 1rem;overflow-x:auto" class="no-scrollbar">
          <button *ngFor="let tab of tabs" (click)="activeTab=tab.id"
            style="display:flex;align-items:center;gap:0.375rem;padding:0.75rem 1rem;font-size:0.8125rem;font-weight:600;border:none;background:none;cursor:pointer;white-space:nowrap;border-bottom:2px solid transparent;transition:all 0.15s;margin-bottom:-1px"
            [style.color]="activeTab===tab.id?'var(--primary)':'var(--muted)'"
            [style.border-bottom-color]="activeTab===tab.id?'var(--primary)':'transparent'">
            <i [class]="tab.icon" style="font-size:0.75rem"></i>{{ tab.label }}
            <span *ngIf="tab.count" class="badge badge-slate" style="font-size:0.6rem;padding:1px 5px">{{ tab.count }}</span>
          </button>
        </div>

        <!-- ======== USERS TAB ======== -->
        <div *ngIf="activeTab==='users'">
          <!-- Filter Bar -->
          <div class="filter-bar">
            <div class="search-wrap" style="flex:1;min-width:200px;max-width:320px">
              <svg class="search-icon-inner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input type="text" [(ngModel)]="userSearch" placeholder="Search users...">
            </div>
            <select [(ngModel)]="roleFilter" class="form-select" style="width:auto;min-width:120px">
              <option value="">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="HR Manager">HR Manager</option>
              <option value="Interviewer">Interviewer</option>
              <option value="Candidate">Candidate</option>
            </select>
            <div style="margin-left:auto">
              <button class="btn-primary">
                <i class="fa-solid fa-plus" style="font-size:0.75rem"></i> Add User
              </button>
            </div>
          </div>

          <!-- Table — exactly like reference image -->
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th style="width:36px"><input type="checkbox" style="width:14px;height:14px;accent-color:var(--primary)"></th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style="text-align:center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let u of filteredUsers">
                  <td><input type="checkbox" style="width:14px;height:14px;accent-color:var(--primary)"></td>
                  <td>
                    <div style="display:flex;align-items:center;gap:0.5rem">
                      <div class="avatar" style="width:28px;height:28px;font-size:0.6875rem;flex-shrink:0">{{ u.name.charAt(0) }}</div>
                      <div>
                        <div style="font-size:0.8125rem;font-weight:600;color:var(--text)">{{ u.name }}</div>
                        <div style="font-size:0.6875rem;color:var(--muted)">{{ u.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td><span [class]="getRoleBadge(u.role)">{{ u.role }}</span></td>
                  <td><span [class]="u.isActive?'badge badge-green':'badge badge-red'">{{ u.isActive?'Active':'Inactive' }}</span></td>
                  <td style="font-size:0.75rem;color:var(--muted)">{{ u.createdAt | date:'dd MMM yyyy' }}</td>
                  <td>
                    <div style="display:flex;align-items:center;justify-content:center;gap:4px">
                      <button class="btn-icon btn-icon-primary" title="Edit User"><i class="fa-regular fa-pen-to-square"></i></button>
                      <button (click)="toggleUser(u)" class="btn-icon" [class]="u.isActive?'btn-icon-danger':'btn-icon-success'"
                              [title]="u.isActive?'Deactivate':'Activate'">
                        <i [class]="u.isActive?'fa-solid fa-ban':'fa-solid fa-check'" style="font-size:0.6875rem"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="pagination-bar">
            <span class="pagination-info">Showing 1–{{ filteredUsers.length }} of {{ users.length }} rows</span>
            <select class="page-size-select"><option>10 / page</option><option>20 / page</option></select>
            <div class="pagination-controls">
              <button class="page-btn" disabled><i class="fa-solid fa-chevron-left" style="font-size:0.6rem"></i>&nbsp;Previous</button>
              <span style="font-size:0.8125rem;color:var(--muted);padding:0 0.25rem">Page 1 of 1</span>
              <button class="page-btn" disabled>Next&nbsp;<i class="fa-solid fa-chevron-right" style="font-size:0.6rem"></i></button>
            </div>
          </div>
        </div>

        <!-- ======== COMPANIES TAB ======== -->
        <div *ngIf="activeTab==='companies'">
          <div class="filter-bar">
            <div class="search-wrap" style="flex:1;min-width:200px;max-width:320px">
              <svg class="search-icon-inner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input type="text" placeholder="Search companies...">
            </div>
            <div style="margin-left:auto">
              <button class="btn-primary"><i class="fa-solid fa-plus" style="font-size:0.75rem"></i> Add Company</button>
            </div>
          </div>
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th style="width:36px"><input type="checkbox" style="width:14px;height:14px;accent-color:var(--primary)"></th>
                  <th>Company</th>
                  <th>Website</th>
                  <th>Plan</th>
                  <th style="text-align:center">Users</th>
                  <th style="text-align:center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let c of companies">
                  <td><input type="checkbox" style="width:14px;height:14px;accent-color:var(--primary)"></td>
                  <td>
                    <div style="display:flex;align-items:center;gap:0.5rem">
                      <div style="width:28px;height:28px;background:var(--primary-l);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:0.875rem;flex-shrink:0">🏢</div>
                      <span style="font-size:0.8125rem;font-weight:600;color:var(--text)">{{ c.name }}</span>
                    </div>
                  </td>
                  <td style="font-size:0.75rem;color:var(--primary)">{{ c.website }}</td>
                  <td><span [class]="getPlanBadge(c.plan)">{{ c.plan }}</span></td>
                  <td style="font-size:0.8125rem;color:var(--text);text-align:center">{{ c.users }}</td>
                  <td>
                    <div style="display:flex;align-items:center;justify-content:center;gap:4px">
                      <button class="btn-icon btn-icon-primary" title="Edit"><i class="fa-regular fa-pen-to-square"></i></button>
                      <button class="btn-icon btn-icon-danger" title="Delete"><i class="fa-regular fa-trash-can"></i></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ======== SUBSCRIPTIONS TAB ======== -->
        <div *ngIf="activeTab==='subscriptions'" style="padding:1.25rem">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem">
            <div *ngFor="let plan of plans" style="border:1px solid var(--border);border-radius:8px;overflow:hidden;position:relative" [style.border-color]="plan.highlighted?'var(--primary)':'var(--border)'">
              <div *ngIf="plan.highlighted" class="badge badge-purple" style="position:absolute;top:0.75rem;right:0.75rem">Popular</div>
              <div [style.background]="plan.highlighted?'var(--primary-l)':'var(--bg)'" style="padding:1rem;border-bottom:1px solid var(--border)">
                <div style="font-size:1rem;font-weight:800;color:var(--text);margin-bottom:2px">{{ plan.name }}</div>
                <div style="font-size:1.75rem;font-weight:900" [style.color]="plan.highlighted?'var(--primary)':'var(--text)'">{{ getPlanPrice(plan) }}<span style="font-size:0.75rem;font-weight:400;color:var(--muted)">/mo</span></div>
              </div>
              <div style="padding:1rem">
                <ul style="list-style:none;margin:0 0 1rem 0;padding:0;display:flex;flex-direction:column;gap:0.5rem">
                  <li *ngFor="let f of plan.features" style="display:flex;align-items:center;gap:0.5rem;font-size:0.8125rem;color:var(--text)">
                    <i class="fa-solid fa-check" style="color:#16A34A;font-size:0.6875rem;flex-shrink:0"></i> {{ f }}
                  </li>
                </ul>
                <button [class]="plan.highlighted?'btn-primary':'btn-secondary'" style="width:100%;justify-content:center">Manage Plan</button>
              </div>
            </div>
          </div>
        </div>

        <!-- ======== AI SETTINGS TAB ======== -->
        <div *ngIf="activeTab==='ai-settings'" style="padding:1.25rem;max-width:600px">
          <div style="display:flex;flex-direction:column;gap:1rem">
            <div class="form-group" style="margin-bottom:0">
              <label class="form-label">OpenAI API Key</label>
              <input type="password" [(ngModel)]="aiConfig.openaiKey" class="form-input" placeholder="sk-...">
            </div>
            <div class="form-group" style="margin-bottom:0">
              <label class="form-label">Gemini API Key</label>
              <input type="password" [(ngModel)]="aiConfig.geminiKey" class="form-input" placeholder="AIza...">
            </div>
            <div class="form-group" style="margin-bottom:0">
              <label class="form-label">AI Model</label>
              <select [(ngModel)]="aiConfig.model" class="form-select">
                <option value="gpt-4o-mini">GPT-4o Mini (Fast & Economical)</option>
                <option value="gpt-4o">GPT-4o (Best Quality)</option>
                <option value="gemini-pro">Gemini Pro</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom:0">
              <label class="form-label" style="display:flex;align-items:center;justify-content:space-between">
                <span>Min. AI Match Score for Auto-Shortlist</span>
                <span style="font-weight:700;color:var(--primary)">{{ aiConfig.minScore }}%</span>
              </label>
              <input type="range" [(ngModel)]="aiConfig.minScore" min="50" max="95" step="5" style="width:100%;accent-color:var(--primary)">
              <div style="display:flex;justify-content:space-between;font-size:0.6875rem;color:var(--muted);margin-top:4px"><span>50%</span><span>95%</span></div>
            </div>
            <div>
              <button (click)="saveAiConfig()" class="btn-primary">
                <i class="fa-solid fa-floppy-disk" style="font-size:0.75rem"></i> Save Settings
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class AdminComponent implements OnInit {
  activeTab = 'users';
  userSearch = '';
  roleFilter = '';

  tabs = [
    { id:'users',         label:'Users',         icon:'fa-solid fa-users',          count:6 },
    { id:'companies',     label:'Companies',      icon:'fa-solid fa-building',        count:4 },
    { id:'subscriptions', label:'Subscriptions',  icon:'fa-solid fa-credit-card',     count:null },
    { id:'ai-settings',   label:'AI Settings',    icon:'fa-solid fa-robot',           count:null },
  ];

  users = [
    { name:'Admin User',    email:'admin@hireflow.ai',   role:'Super Admin', isActive:true,  createdAt:new Date('2024-01-01') },
    { name:'Sarah Mitchell',email:'sarah@company.com',   role:'HR Manager',  isActive:true,  createdAt:new Date('2024-02-15') },
    { name:'John Patel',    email:'john@company.com',    role:'HR Manager',  isActive:true,  createdAt:new Date('2024-03-01') },
    { name:'Alex Johnson',  email:'alex@example.com',    role:'Candidate',   isActive:true,  createdAt:new Date('2024-04-10') },
    { name:'Maria Garcia',  email:'maria@example.com',   role:'Candidate',   isActive:false, createdAt:new Date('2024-04-20') },
    { name:'David Kim',     email:'david@company.com',   role:'Interviewer', isActive:true,  createdAt:new Date('2024-05-01') },
  ];

  get filteredUsers() {
    return this.users.filter(u => {
      const matchS = !this.userSearch || u.name.toLowerCase().includes(this.userSearch.toLowerCase()) || u.email.toLowerCase().includes(this.userSearch.toLowerCase());
      const matchR = !this.roleFilter || u.role === this.roleFilter;
      return matchS && matchR;
    });
  }

  companies = [
    { name:'TechCorp Inc.',    website:'techcorp.com',       plan:'Enterprise', users:25 },
    { name:'StartupXYZ',       website:'startupxyz.io',      plan:'Pro',        users:8  },
    { name:'Acme Corp',        website:'acme.com',           plan:'Free',       users:3  },
    { name:'Innovation Labs',  website:'innovationlabs.ai',  plan:'Enterprise', users:42 },
  ];

  plans = [
    { name:'Free',       price:0,   features:['1 Active Job','Up to 50 Candidates','Basic Email Support'],                                                highlighted:false },
    { name:'Pro',        price:49,  features:['10 Active Jobs','Unlimited Candidates','AI Resume Parsing','Priority Support'],                             highlighted:true  },
    { name:'Enterprise', price:199, features:['Unlimited Jobs','AI Candidate Ranking','Custom Workflows','Dedicated Account Manager'],                     highlighted:false },
  ];

  aiConfig = { openaiKey:'sk-xxxxxxxxxxxxxxxxxxxx', geminiKey:'', model:'gpt-4o-mini', minScore:75 };

  constructor() {}
  ngOnInit() {}

  getRoleBadge(role: string): string {
    const m: any = { 'Super Admin':'badge badge-red','HR Manager':'badge badge-purple','Interviewer':'badge badge-blue','Candidate':'badge badge-slate' };
    return m[role]||'badge badge-slate';
  }
  getPlanBadge(plan: string): string {
    const m: any = { 'Enterprise':'badge badge-purple','Pro':'badge badge-blue','Free':'badge badge-slate' };
    return m[plan]||'badge badge-slate';
  }
  getPlanPrice(plan: any): string { return plan.price===0?'Free':'$'+plan.price; }
  toggleUser(u: any) { u.isActive=!u.isActive; }
  saveAiConfig() { alert('AI Configuration saved!'); }
}
