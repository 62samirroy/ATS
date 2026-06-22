import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CandidateSetting {
  _id?: string;
  name: string;
  type: 'status' | 'source';
  color?: string;
}

@Injectable({ providedIn: 'root' })
export class CandidateSettingsService {
  private apiUrl = `${environment.apiUrl}/candidate-settings`;

  constructor(private http: HttpClient) {}

  getSettings(type?: 'status' | 'source'): Observable<CandidateSetting[]> {
    const url = type ? `${this.apiUrl}?type=${type}` : this.apiUrl;
    return this.http.get<CandidateSetting[]>(url);
  }

  createSetting(setting: CandidateSetting): Observable<CandidateSetting> {
    return this.http.post<CandidateSetting>(this.apiUrl, setting);
  }

  updateSetting(id: string, setting: Partial<CandidateSetting>): Observable<CandidateSetting> {
    return this.http.put<CandidateSetting>(`${this.apiUrl}/${id}`, setting);
  }

  deleteSetting(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
