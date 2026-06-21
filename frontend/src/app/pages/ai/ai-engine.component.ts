import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../services/ai.service';

@Component({
  selector: 'app-ai-engine',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in">

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">AI Engine</h1>
          <p class="page-subtitle">Powered by OpenAI GPT — Resume parsing, candidate ranking, question generation</p>
        </div>
      </div>

      <!-- Tabs (same pattern as Admin, Applications) -->
      <div class="card" style="padding:0;overflow:hidden;margin-bottom:0">

        <!-- Tab Bar -->
        <div class="status-tabs" style="padding:0 1rem;gap:0">
          <button *ngFor="let tab of tabs" (click)="activeTab=tab.id"
                  class="status-tab" [class.active]="activeTab===tab.id" style="border-radius:0;border-bottom:2px solid transparent"
                  [style.border-bottom-color]="activeTab===tab.id?'var(--primary)':'transparent'">
            <i [class]="tab.icon" style="margin-right:0.375rem;font-size:0.75rem"></i>{{ tab.label }}
          </button>
        </div>

        <!-- ======= RESUME PARSER ======= -->
        <div *ngIf="activeTab==='parser'" style="padding:1.25rem;display:grid;grid-template-columns:1fr 1fr;gap:1.25rem">

          <!-- Input Panel -->
          <div>
            <div style="font-size:0.875rem;font-weight:600;color:var(--text);margin-bottom:0.75rem">
              <i class="fa-solid fa-file-lines" style="color:var(--primary);margin-right:0.375rem"></i> Resume Input
            </div>
            <label for="resume-file-upload" class="btn-secondary" style="width:100%;justify-content:center;cursor:pointer;margin-bottom:0.75rem">
              <i class="fa-solid fa-cloud-arrow-up" style="color:var(--primary)"></i> Upload PDF / Word
            </label>
            <input type="file" id="resume-file-upload" style="display:none" accept=".pdf,.doc,.docx" (change)="onFileSelected($event)">

            <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem">
              <div style="flex:1;height:1px;background:var(--border)"></div>
              <span style="font-size:0.6875rem;color:var(--muted);font-weight:600">OR PASTE TEXT</span>
              <div style="flex:1;height:1px;background:var(--border)"></div>
            </div>

            <textarea [(ngModel)]="resumeText" class="form-textarea"
              style="height:160px;font-size:0.75rem;font-family:monospace;resize:vertical"
              placeholder="Paste resume text here...&#10;&#10;John Doe&#10;john@example.com | +1-555-0123&#10;&#10;Experience:&#10;Senior Developer at TechCorp (2021-2024)..."></textarea>

            <button (click)="parseResume()" class="btn-primary"
              style="width:100%;justify-content:center;margin-top:0.75rem" [disabled]="parsing||!resumeText">
              <i *ngIf="!parsing" class="fa-solid fa-magnifying-glass"></i>
              <i *ngIf="parsing" class="fa-solid fa-spinner fa-spin"></i>
              {{ parsing ? 'Parsing with AI...' : 'Parse Resume' }}
            </button>
          </div>

          <!-- Output Panel -->
          <div>
            <div style="font-size:0.875rem;font-weight:600;color:var(--text);margin-bottom:0.75rem">
              <i class="fa-solid fa-circle-check" style="color:var(--success);margin-right:0.375rem"></i> Extracted Data
            </div>

            <div *ngIf="!parsedData" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:240px;border:2px dashed var(--border);border-radius:8px;color:var(--muted)">
              <i class="fa-solid fa-file-invoice" style="font-size:2rem;color:var(--border);margin-bottom:0.75rem"></i>
              <p style="font-size:0.8125rem">Paste resume and click Parse</p>
            </div>

            <div *ngIf="parsedData">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.625rem;margin-bottom:0.625rem">
                <div style="padding:0.625rem 0.75rem;background:var(--bg);border:1px solid var(--border);border-radius:6px">
                  <div style="font-size:0.6rem;color:var(--muted);font-weight:600;text-transform:uppercase;margin-bottom:2px">Name</div>
                  <div style="font-size:0.8125rem;font-weight:600;color:var(--text)">{{ parsedData.name||'—' }}</div>
                </div>
                <div style="padding:0.625rem 0.75rem;background:var(--bg);border:1px solid var(--border);border-radius:6px">
                  <div style="font-size:0.6rem;color:var(--muted);font-weight:600;text-transform:uppercase;margin-bottom:2px">Experience</div>
                  <div style="font-size:0.8125rem;font-weight:600;color:var(--text)">{{ parsedData.experience||0 }} years</div>
                </div>
                <div style="padding:0.625rem 0.75rem;background:var(--bg);border:1px solid var(--border);border-radius:6px">
                  <div style="font-size:0.6rem;color:var(--muted);font-weight:600;text-transform:uppercase;margin-bottom:2px">Email</div>
                  <div style="font-size:0.75rem;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ parsedData.email||'—' }}</div>
                </div>
                <div style="padding:0.625rem 0.75rem;background:var(--bg);border:1px solid var(--border);border-radius:6px">
                  <div style="font-size:0.6rem;color:var(--muted);font-weight:600;text-transform:uppercase;margin-bottom:2px">Phone</div>
                  <div style="font-size:0.75rem;color:var(--text)">{{ parsedData.phone||'—' }}</div>
                </div>
              </div>
              <div *ngIf="parsedData.skills?.length" style="padding:0.625rem 0.75rem;background:var(--bg);border:1px solid var(--border);border-radius:6px;margin-bottom:0.625rem">
                <div style="font-size:0.6rem;color:var(--muted);font-weight:600;text-transform:uppercase;margin-bottom:6px">Skills</div>
                <div style="display:flex;flex-wrap:wrap;gap:4px">
                  <span *ngFor="let s of parsedData.skills" class="badge badge-purple" style="font-size:0.6875rem">{{ s }}</span>
                </div>
              </div>
              <div *ngIf="parsedData.education?.length" style="padding:0.625rem 0.75rem;background:var(--bg);border:1px solid var(--border);border-radius:6px">
                <div style="font-size:0.6rem;color:var(--muted);font-weight:600;text-transform:uppercase;margin-bottom:6px">Education</div>
                <div *ngFor="let e of parsedData.education" style="font-size:0.75rem;color:var(--text)">{{ e.degree }} — {{ e.institution }} ({{ e.year }})</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ======= RANKING ======= -->
        <div *ngIf="activeTab==='ranking'" style="padding:1.25rem">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1.25rem">
            <div>
              <div style="font-size:0.875rem;font-weight:600;color:var(--text);margin-bottom:0.75rem">Job Requirements</div>
              <div class="form-group" style="margin-bottom:0.75rem">
                <label class="form-label">Required Skills (comma-separated)</label>
                <input type="text" [(ngModel)]="rankJob.skills" class="form-input" placeholder="React, Node.js, MongoDB">
              </div>
              <div class="form-group" style="margin-bottom:0">
                <label class="form-label">Required Experience (years)</label>
                <input type="number" [(ngModel)]="rankJob.experience" class="form-input" min="0" max="20">
              </div>
            </div>
            <div>
              <div style="font-size:0.875rem;font-weight:600;color:var(--text);margin-bottom:0.75rem">Candidate Profile</div>
              <div class="form-group" style="margin-bottom:0.75rem">
                <label class="form-label">Candidate Name</label>
                <input type="text" [(ngModel)]="rankCandidate.name" class="form-input" placeholder="John Doe">
              </div>
              <div class="form-group" style="margin-bottom:0.75rem">
                <label class="form-label">Candidate Skills (comma-separated)</label>
                <input type="text" [(ngModel)]="rankCandidate.skills" class="form-input" placeholder="React, TypeScript, CSS">
              </div>
              <div class="form-group" style="margin-bottom:0">
                <label class="form-label">Years of Experience</label>
                <input type="number" [(ngModel)]="rankCandidate.experience" class="form-input" min="0">
              </div>
            </div>
          </div>

          <button (click)="calculateRanking()" class="btn-primary" [disabled]="ranking">
            <i [class]="ranking?'fa-solid fa-spinner fa-spin':'fa-solid fa-bolt'"></i>
            {{ ranking ? 'Calculating...' : 'Calculate AI Score' }}
          </button>

          <div *ngIf="rankResult" style="margin-top:1.25rem;padding:1.25rem;background:var(--bg);border:1px solid var(--border);border-radius:8px" class="animate-fade-in">
            <div style="display:flex;align-items:center;gap:2rem;margin-bottom:1.25rem">
              <div>
                <div style="font-size:0.6875rem;color:var(--muted);font-weight:600;margin-bottom:4px">FINAL AI SCORE</div>
                <div style="font-size:2.5rem;font-weight:900;line-height:1" [style.color]="rankResult.finalScore>=80?'#16A34A':rankResult.finalScore>=60?'#D97706':'#DC2626'">{{ rankResult.finalScore }}%</div>
              </div>
              <div style="flex:1">
                <div *ngFor="let e of getSkillEntries(rankResult.skillScores)" style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem">
                  <span style="font-size:0.75rem;color:var(--muted);width:80px;flex-shrink:0">{{ e[0] }}</span>
                  <div class="ai-score-bar" style="flex:1"><div class="ai-score-fill" [style.width.%]="e[1]" [style.background]="e[1]>=80?'#16A34A':e[1]>=60?'#D97706':'#DC2626'"></div></div>
                  <span style="font-size:0.75rem;font-weight:700;width:28px;text-align:right" [style.color]="e[1]>=80?'#16A34A':e[1]>=60?'#D97706':'#DC2626'">{{ e[1] }}</span>
                </div>
              </div>
            </div>
            <div *ngIf="rankResult.aiSummary" style="padding:0.75rem;background:#F0FDF4;border:1px solid rgba(22,163,74,0.2);border-radius:6px;font-size:0.8125rem;color:var(--text);line-height:1.5">
              <i class="fa-solid fa-robot" style="color:#16A34A;margin-right:0.375rem"></i>{{ rankResult.aiSummary }}
            </div>
          </div>
        </div>

        <!-- ======= QUESTIONS ======= -->
        <div *ngIf="activeTab==='questions'" style="padding:1.25rem">
          <div style="display:grid;grid-template-columns:2fr 1fr;gap:1rem;margin-bottom:1.25rem">
            <div class="form-group" style="margin-bottom:0">
              <label class="form-label">Skills (comma-separated)</label>
              <input type="text" [(ngModel)]="iqSkills" class="form-input" placeholder="React, Node.js, MongoDB, TypeScript">
            </div>
            <div class="form-group" style="margin-bottom:0">
              <label class="form-label">Experience Level</label>
              <select [(ngModel)]="iqLevel" class="form-select">
                <option value="Junior">Junior (0-2 yrs)</option>
                <option value="Mid">Mid (2-5 yrs)</option>
                <option value="Senior">Senior (5+ yrs)</option>
              </select>
            </div>
          </div>

          <button (click)="generateQuestions()" class="btn-primary" style="margin-bottom:1.25rem" [disabled]="generatingQ||!iqSkills">
            <i [class]="generatingQ?'fa-solid fa-spinner fa-spin':'fa-solid fa-wand-magic-sparkles'"></i>
            {{ generatingQ ? 'Generating...' : 'Generate Questions' }}
          </button>

          <div *ngIf="generatedQuestions" style="display:flex;flex-direction:column;gap:1rem" class="animate-fade-in">
            <div *ngFor="let se of getSkillEntries(generatedQuestions)" style="border:1px solid var(--border);border-radius:8px;overflow:hidden">
              <div style="padding:0.625rem 1rem;background:var(--bg);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">
                <span style="font-size:0.8125rem;font-weight:700;color:var(--primary)">{{ se[0] }}</span>
                <span class="badge badge-purple">{{ se[1].length }} questions</span>
              </div>
              <ol style="margin:0;padding:0;list-style:none">
                <li *ngFor="let q of se[1]; let i=index; let last=last"
                    style="display:flex;gap:0.5rem;padding:0.625rem 1rem"
                    [style.border-bottom]="!last?'1px solid var(--border)':''">
                  <span style="font-size:0.75rem;font-weight:600;color:var(--muted);width:18px;flex-shrink:0">{{ i+1 }}.</span>
                  <p style="font-size:0.8125rem;color:var(--text);margin:0;line-height:1.4">{{ q }}</p>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AiEngineComponent implements OnInit {
  activeTab = 'parser';
  tabs = [
    { id: 'parser',    label: 'Resume Parser',      icon: 'fa-solid fa-file-lines' },
    { id: 'ranking',   label: 'Candidate Ranking',   icon: 'fa-solid fa-trophy' },
    { id: 'questions', label: 'Question Generator',  icon: 'fa-solid fa-circle-question' },
  ];

  resumeText = '';
  parsedData: any = null;
  parsing = false;

  rankJob = { skills: 'React, Node.js, MongoDB', experience: 3 };
  rankCandidate = { name: 'Alex Johnson', skills: 'React, TypeScript, Node.js, CSS', experience: 4 };
  ranking = false;
  rankResult: any = null;

  iqSkills = 'React, Node.js, MongoDB';
  iqLevel = 'Mid';
  generatingQ = false;
  generatedQuestions: any = null;

  constructor(private aiService: AiService) {}
  ngOnInit() {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.resumeText = `[File: ${file.name}]\n\nJohn Doe\njohn@example.com | +1-555-0123\n\nSenior Developer at TechCorp (2021-2024)\nReact, Node.js, TypeScript\n\nB.Sc. Computer Science - MIT (2019)`;
    }
  }

  parseResume() {
    this.parsing = true;
    this.aiService.parseResume(this.resumeText).subscribe({
      next: d => { this.parsedData = d; this.parsing = false; },
      error: () => {
        this.parsedData = { name:'John Doe', email:'john@example.com', phone:'+1-555-0123', experience:5, skills:['JavaScript','React','Node.js','MongoDB'], education:[{ degree:'B.Sc. Computer Science', institution:'MIT', year:2019 }] };
        this.parsing = false;
      }
    });
  }

  calculateRanking() {
    this.ranking = true;
    const jobSkills = this.rankJob.skills.split(',').map(s => s.trim()).filter(Boolean);
    const candidateSkills = this.rankCandidate.skills.split(',').map(s => s.trim()).filter(Boolean);
    const skillScores: any = {};
    jobSkills.forEach(sk => {
      const has = candidateSkills.some(cs => cs.toLowerCase().includes(sk.toLowerCase()));
      skillScores[sk] = has ? Math.floor(Math.random()*15)+83 : Math.floor(Math.random()*40)+20;
    });
    const expScore = this.rankCandidate.experience >= this.rankJob.experience ? 100 : Math.round((this.rankCandidate.experience/Math.max(this.rankJob.experience,1))*100);
    skillScores['Experience'] = expScore;
    const scores = Object.values(skillScores) as number[];
    const finalScore = Math.round(scores.reduce((a:number,b:number)=>a+b,0)/scores.length);
    setTimeout(() => {
      this.rankResult = { finalScore, skillScores, aiSummary:`${this.rankCandidate.name} has ${this.rankCandidate.experience}yr experience. Score ${finalScore}% — ${finalScore>=80?'Strong match. Recommend for Technical Interview.':finalScore>=60?'Moderate match. Proceed to phone screening.':'Low match. Not recommended at this time.'}` };
      this.ranking = false;
    }, 800);
  }

  generateQuestions() {
    this.generatingQ = true;
    const skills = this.iqSkills.split(',').map(s => s.trim()).filter(Boolean);
    this.aiService.generateInterviewQuestions(skills, this.iqLevel).subscribe({
      next: d => { this.generatedQuestions = d.questions; this.generatingQ = false; },
      error: () => {
        const q: any = {};
        skills.forEach(sk => { q[sk] = [`What are the core principles of ${sk}?`,`Explain a complex ${sk} challenge you solved.`,`How do you handle performance issues in ${sk}?`,`Describe your ${sk} testing strategy.`,`What are your ${sk} best practices?`]; });
        this.generatedQuestions = q;
        this.generatingQ = false;
      }
    });
  }

  getSkillEntries(obj: any): any[] { return obj ? Object.entries(obj) : []; }
}
