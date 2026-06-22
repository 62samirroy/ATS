import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CandidateService {
  private apiUrl = `${environment.apiUrl}/candidates`;
  constructor(private http: HttpClient) {}

  getCandidates(params?: any): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { params });
  }
  getCandidateById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  getCandidateApplications(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/applications`);
  }
  createCandidate(candidate: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, candidate);
  }
  updateCandidate(id: string, candidate: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, candidate);
  }
  deleteCandidate(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
  getCandidateAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analytics`);
  }
  getDeletedCandidates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/deleted`);
  }
  restoreCandidate(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/restore`, {});
  }
  permanentDeleteCandidate(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}/permanent`);
  }
}
