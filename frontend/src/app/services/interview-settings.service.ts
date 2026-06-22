import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface InterviewSetting {
  _id?: string;
  name: string;
  type: 'status' | 'type';
  color?: string;
}

@Injectable({ providedIn: 'root' })
export class InterviewSettingsService {
  private apiUrl = `${environment.apiUrl}/interview-settings`;

  constructor(private http: HttpClient) {}

  getSettings(type?: 'status' | 'type'): Observable<InterviewSetting[]> {
    const url = type ? `${this.apiUrl}?type=${type}` : this.apiUrl;
    return this.http.get<InterviewSetting[]>(url);
  }

  createSetting(setting: InterviewSetting): Observable<InterviewSetting> {
    return this.http.post<InterviewSetting>(this.apiUrl, setting);
  }

  updateSetting(id: string, setting: Partial<InterviewSetting>): Observable<InterviewSetting> {
    return this.http.put<InterviewSetting>(`${this.apiUrl}/${id}`, setting);
  }

  deleteSetting(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
