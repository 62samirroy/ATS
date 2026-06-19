import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AiService {
  private apiUrl = `${environment.apiUrl}/ai`;
  constructor(private http: HttpClient) {}

  parseResume(resumeText: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/parse-resume`, { resumeText });
  }
  rankCandidate(candidateId: string, jobId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/rank-candidate`, { candidateId, jobId });
  }
  generateInterviewQuestions(skills: string[], level: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/generate-questions`, { skills, level });
  }
}
