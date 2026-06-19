import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private apiUrl = `${environment.apiUrl}/applications`;
  constructor(private http: HttpClient) {}

  getApplications(params?: any): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { params });
  }
  createApplication(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
  updateStatus(id: string, status: string, notes?: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/status`, { status, notes });
  }
  getAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analytics`);
  }
}
