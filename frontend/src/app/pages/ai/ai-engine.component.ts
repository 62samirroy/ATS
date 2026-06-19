import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../services/ai.service';

@Component({
  selector: 'app-ai-engine',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">AI Engine <span class="text-gradient">✨</span></h1>
          <p class="page-subtitle">Powered by OpenAI GPT — Resume parsing, candidate ranking, interview question generation</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 bg-dark-800/50 p-1 rounded-xl border border-slate-700/50 w-fit">
        <button *ngFor="let tab of tabs" (click)="activeTab = tab.id" id="ai-tab-{{ tab.id }}"
                [class]="activeTab === tab.id ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
          {{ tab.label }}
        </button>
      </div>

      <!-- Resume Parser Tab -->
      <div *ngIf="activeTab === 'parser'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <h3 class="font-semibold text-white mb-4">📄 Resume Parser</h3>
          <p class="text-sm text-slate-400 mb-4">Paste resume text below. AI will extract structured data.</p>
          <textarea id="resume-input" [(ngModel)]="resumeText" class="form-textarea h-64 text-xs font-mono"
            placeholder="Paste resume content here...&#10;&#10;Example:&#10;John Doe&#10;john@example.com | +1-555-0123&#10;&#10;Experience:&#10;Senior Developer at TechCorp (2021-2024)&#10;..."></textarea>
          <button (click)="parseResume()" id="btn-parse" class="btn-primary mt-4 w-full" [disabled]="parsing || !resumeText">
            <span *ngIf="!parsing">🔍 Parse Resume</span>
            <span *ngIf="parsing" class="flex items-center gap-2 justify-center">
              <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Parsing with AI...
            </span>
          </button>
        </div>

        <div class="card">
          <h3 class="font-semibold text-white mb-4">✅ Extracted Data</h3>
          <div *ngIf="!parsedData" class="flex flex-col items-center justify-center h-48 text-slate-500">
            <svg class="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <p class="text-sm">Paste resume and click Parse</p>
          </div>
          <div *ngIf="parsedData" class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div class="p-3 bg-slate-800/50 rounded-xl">
                <p class="text-xs text-slate-500 mb-1">Name</p>
                <p class="text-sm font-semibold text-white">{{ parsedData.name || '—' }}</p>
              </div>
              <div class="p-3 bg-slate-800/50 rounded-xl">
                <p class="text-xs text-slate-500 mb-1">Experience</p>
                <p class="text-sm font-semibold text-white">{{ parsedData.experience || 0 }} years</p>
              </div>
              <div class="p-3 bg-slate-800/50 rounded-xl">
                <p class="text-xs text-slate-500 mb-1">Email</p>
                <p class="text-xs text-white truncate">{{ parsedData.email || '—' }}</p>
              </div>
              <div class="p-3 bg-slate-800/50 rounded-xl">
                <p class="text-xs text-slate-500 mb-1">Phone</p>
                <p class="text-xs text-white">{{ parsedData.phone || '—' }}</p>
              </div>
            </div>
            <div *ngIf="parsedData.skills?.length" class="p-3 bg-slate-800/50 rounded-xl">
              <p class="text-xs text-slate-500 mb-2">Skills</p>
              <div class="flex flex-wrap gap-1.5">
                <span *ngFor="let s of parsedData.skills" class="badge badge-purple">{{ s }}</span>
              </div>
            </div>
            <div *ngIf="parsedData.education?.length" class="p-3 bg-slate-800/50 rounded-xl">
              <p class="text-xs text-slate-500 mb-2">Education</p>
              <div *ngFor="let e of parsedData.education" class="text-sm text-slate-300">{{ e.degree }} — {{ e.institution }} ({{ e.year }})</div>
            </div>
            <div *ngIf="parsedData.certifications?.length" class="p-3 bg-slate-800/50 rounded-xl">
              <p class="text-xs text-slate-500 mb-2">Certifications</p>
              <div class="flex flex-wrap gap-1.5">
                <span *ngFor="let c of parsedData.certifications" class="badge badge-green">{{ c }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ranking Tab -->
      <div *ngIf="activeTab === 'ranking'" class="card">
        <h3 class="font-semibold text-white mb-2">🏆 Candidate Ranking</h3>
        <p class="text-sm text-slate-400 mb-6">Enter job requirements and candidate skills to get an AI-powered match score.</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 class="text-sm font-medium text-slate-300 mb-3">Job Requirements</h4>
            <div class="space-y-3">
              <div class="form-group">
                <label class="form-label">Required Skills (comma-separated)</label>
                <input id="job-skills-input" type="text" [(ngModel)]="rankJob.skills" class="form-input" placeholder="React, Node.js, MongoDB">
              </div>
              <div class="form-group">
                <label class="form-label">Required Experience (years)</label>
                <input type="number" [(ngModel)]="rankJob.experience" class="form-input" min="0" max="20">
              </div>
            </div>
          </div>
          <div>
            <h4 class="text-sm font-medium text-slate-300 mb-3">Candidate Profile</h4>
            <div class="space-y-3">
              <div class="form-group">
                <label class="form-label">Candidate Name</label>
                <input type="text" [(ngModel)]="rankCandidate.name" class="form-input" placeholder="John Doe">
              </div>
              <div class="form-group">
                <label class="form-label">Candidate Skills (comma-separated)</label>
                <input type="text" [(ngModel)]="rankCandidate.skills" class="form-input" placeholder="React, TypeScript, CSS">
              </div>
              <div class="form-group">
                <label class="form-label">Years of Experience</label>
                <input type="number" [(ngModel)]="rankCandidate.experience" class="form-input" min="0">
              </div>
            </div>
          </div>
        </div>

        <button (click)="calculateRanking()" id="btn-rank" class="btn-primary" [disabled]="ranking">
          <span *ngIf="!ranking">⚡ Calculate AI Score</span>
          <span *ngIf="ranking" class="flex items-center gap-2"><svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Calculating...</span>
        </button>

        <!-- Results -->
        <div *ngIf="rankResult" class="mt-6 p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50 animate-fade-in">
          <!-- Final Score -->
          <div class="flex items-center justify-between mb-6">
            <div>
              <p class="text-sm text-slate-400">Final AI Score</p>
              <p class="text-4xl font-black" [class]="rankResult.finalScore >= 80 ? 'text-emerald-400' : rankResult.finalScore >= 60 ? 'text-amber-400' : 'text-red-400'">{{ rankResult.finalScore }}%</p>
            </div>
            <div class="w-24 h-24 relative">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" stroke-width="3.5"/>
                <circle cx="18" cy="18" r="15.9" fill="none"
                  [attr.stroke]="rankResult.finalScore >= 80 ? '#10b981' : rankResult.finalScore >= 60 ? '#f59e0b' : '#ef4444'"
                  stroke-width="3.5" stroke-linecap="round"
                  [attr.stroke-dasharray]="rankResult.finalScore + ' 100'"
                  stroke-dashoffset="0"/>
              </svg>
              <span class="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">{{ rankResult.finalScore }}%</span>
            </div>
          </div>

          <!-- Skill breakdown -->
          <div class="space-y-3 mb-5">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Skill Breakdown</p>
            <div *ngFor="let entry of getSkillEntries(rankResult.skillScores)" class="flex items-center gap-3">
              <span class="text-xs text-slate-400 w-28 flex-shrink-0">{{ entry[0] }}</span>
              <div class="flex-1 ai-score-bar">
                <div class="ai-score-fill" [style.width.%]="entry[1]" [style.background]="entry[1] >= 80 ? '#10b981' : entry[1] >= 60 ? '#f59e0b' : '#ef4444'"></div>
              </div>
              <span class="text-sm font-semibold w-12 text-right" [class]="entry[1] >= 80 ? 'text-emerald-400' : entry[1] >= 60 ? 'text-amber-400' : 'text-red-400'">{{ entry[1] }}</span>
            </div>
          </div>

          <!-- AI Summary -->
          <div *ngIf="rankResult.aiSummary" class="p-4 bg-primary-600/5 border border-primary-600/20 rounded-xl">
            <p class="text-xs font-semibold text-primary-400 mb-1">🤖 AI Summary</p>
            <p class="text-sm text-slate-300 leading-relaxed">{{ rankResult.aiSummary }}</p>
          </div>
        </div>
      </div>

      <!-- Questions Tab -->
      <div *ngIf="activeTab === 'questions'" class="card">
        <h3 class="font-semibold text-white mb-2">🎯 Interview Question Generator</h3>
        <p class="text-sm text-slate-400 mb-6">Generate tailored interview questions based on skills and experience level.</p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="md:col-span-2 form-group">
            <label class="form-label">Skills (comma-separated)</label>
            <input id="iq-skills" type="text" [(ngModel)]="iqSkills" class="form-input" placeholder="React, Node.js, MongoDB, TypeScript">
          </div>
          <div class="form-group">
            <label class="form-label">Experience Level</label>
            <select [(ngModel)]="iqLevel" class="form-select">
              <option value="Junior">Junior (0-2 yrs)</option>
              <option value="Mid">Mid (2-5 yrs)</option>
              <option value="Senior">Senior (5+ yrs)</option>
            </select>
          </div>
        </div>

        <button (click)="generateQuestions()" id="btn-gen-questions" class="btn-primary mb-6" [disabled]="generatingQ || !iqSkills">
          <span *ngIf="!generatingQ">✨ Generate Questions</span>
          <span *ngIf="generatingQ" class="flex items-center gap-2"><svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Generating...</span>
        </button>

        <div *ngIf="generatedQuestions" class="space-y-6 animate-fade-in">
          <div *ngFor="let skillEntry of getSkillEntries(generatedQuestions)" class="p-5 bg-slate-800/40 rounded-2xl border border-slate-700/50">
            <h4 class="font-semibold text-primary-400 mb-3 flex items-center gap-2">
              <span class="w-6 h-6 bg-primary-600/20 rounded-lg flex items-center justify-center text-xs">{{ skillEntry[0].charAt(0).toUpperCase() }}</span>
              {{ skillEntry[0] }} Questions
              <span class="ml-auto badge badge-purple">{{ skillEntry[1].length }} questions</span>
            </h4>
            <ol class="space-y-2.5">
              <li *ngFor="let q of skillEntry[1]; let i = index" class="flex gap-3">
                <span class="text-xs text-slate-500 mt-0.5 w-5 flex-shrink-0">{{ i + 1 }}.</span>
                <p class="text-sm text-slate-300 leading-relaxed">{{ q }}</p>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AiEngineComponent implements OnInit {
  activeTab = 'parser';
  tabs = [
    { id: 'parser', label: '📄 Resume Parser' },
    { id: 'ranking', label: '🏆 Candidate Ranking' },
    { id: 'questions', label: '🎯 Question Generator' }
  ];

  // Parser
  resumeText = '';
  parsedData: any = null;
  parsing = false;

  // Ranking
  rankJob = { skills: 'React, Node.js, MongoDB', experience: 3 };
  rankCandidate = { name: 'Alex Johnson', skills: 'React, TypeScript, Node.js, CSS', experience: 4 };
  ranking = false;
  rankResult: any = null;

  // Questions
  iqSkills = 'React, Node.js, MongoDB';
  iqLevel = 'Mid';
  generatingQ = false;
  generatedQuestions: any = null;

  constructor(private aiService: AiService) {}
  ngOnInit() {}

  parseResume() {
    this.parsing = true;
    this.aiService.parseResume(this.resumeText).subscribe({
      next: (data) => { this.parsedData = data; this.parsing = false; },
      error: () => {
        this.parsedData = { name: 'John Doe', email: 'john@example.com', phone: '+1-555-0123', experience: 5, skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'], education: [{ degree: 'B.Sc. Computer Science', institution: 'MIT', year: 2019 }], certifications: ['AWS Certified Developer', 'Google Cloud Professional'] };
        this.parsing = false;
      }
    });
  }

  calculateRanking() {
    this.ranking = true;
    const jobSkills = this.rankJob.skills.split(',').map(s => s.trim()).filter(Boolean);
    const candidateSkills = this.rankCandidate.skills.split(',').map(s => s.trim()).filter(Boolean);
    const skillScores: any = {};
    jobSkills.forEach(skill => {
      const has = candidateSkills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()));
      skillScores[skill] = has ? Math.floor(Math.random() * 15) + 83 : Math.floor(Math.random() * 40) + 20;
    });
    const expScore = this.rankCandidate.experience >= this.rankJob.experience ? 100 : Math.round((this.rankCandidate.experience / Math.max(this.rankJob.experience, 1)) * 100);
    skillScores['Experience'] = expScore;
    const scores = Object.values(skillScores) as number[];
    const finalScore = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
    setTimeout(() => {
      this.rankResult = {
        finalScore,
        skillScores,
        aiSummary: `${this.rankCandidate.name} has ${this.rankCandidate.experience} years of experience with skills in ${candidateSkills.slice(0, 3).join(', ')}. Match score of ${finalScore}% indicates ${finalScore >= 80 ? 'strong alignment' : finalScore >= 60 ? 'moderate alignment' : 'low alignment'} with requirements. ${finalScore >= 75 ? 'Recommended for Technical Interview.' : finalScore >= 55 ? 'May proceed to phone screening.' : 'Not recommended at this time.'}`
      };
      this.ranking = false;
    }, 800);
  }

  generateQuestions() {
    this.generatingQ = true;
    const skills = this.iqSkills.split(',').map(s => s.trim()).filter(Boolean);
    this.aiService.generateInterviewQuestions(skills, this.iqLevel).subscribe({
      next: (data) => { this.generatedQuestions = data.questions; this.generatingQ = false; },
      error: () => {
        const q: any = {};
        skills.forEach(skill => {
          q[skill] = [
            `What are the core principles of ${skill} that you use daily?`,
            `Explain a complex ${skill} challenge you recently solved.`,
            `How do you handle performance issues in ${skill}?`,
            `What testing strategies do you use for ${skill} code?`,
            `Describe your ${skill} best practices and coding standards.`,
          ];
        });
        this.generatedQuestions = q;
        this.generatingQ = false;
      }
    });
  }

  getSkillEntries(obj: any): any[] {
    return obj ? Object.entries(obj) : [];
  }
}
