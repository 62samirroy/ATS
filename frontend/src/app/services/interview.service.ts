import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InterviewService {
  private apiUrl = `${environment.apiUrl}/interviews`;
  constructor(private http: HttpClient) {}

  getInterviews(params?: any): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { params });
  }
  getTodaysInterviews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/today`);
  }
  scheduleInterview(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
  updateInterview(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }
  submitFeedback(id: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/feedback`, data);
  }
}
