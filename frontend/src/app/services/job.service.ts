import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class JobService {
  private apiUrl = `${environment.apiUrl}/jobs`;
  constructor(private http: HttpClient) {}

  getJobs(params?: any): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { params });
  }
  getJobById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  createJob(job: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, job);
  }
  updateJob(id: string, job: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, job);
  }
  deleteJob(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
  publishJob(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/publish`, {});
  }
  getJobAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analytics`);
  }
}
