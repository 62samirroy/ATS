import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface JobSetting {
  _id?: string;
  type: 'status' | 'jobType';
  name: string;
  color?: string;
}

@Injectable({
  providedIn: 'root'
})
export class JobSettingsService {
  private apiUrl = `${environment.apiUrl}/job-settings`;

  constructor(private http: HttpClient) {}

  getSettings(type?: string): Observable<JobSetting[]> {
    const url = type ? `${this.apiUrl}?type=${type}` : this.apiUrl;
    return this.http.get<JobSetting[]>(url);
  }

  createSetting(data: JobSetting): Observable<JobSetting> {
    return this.http.post<JobSetting>(this.apiUrl, data);
  }

  updateSetting(id: string, data: Partial<JobSetting>): Observable<JobSetting> {
    return this.http.put<JobSetting>(`${this.apiUrl}/${id}`, data);
  }

  deleteSetting(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
