import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ApplicationSetting {
  _id?: string;
  name: string;
  type: 'status';
  color?: string;
}

@Injectable({ providedIn: 'root' })
export class ApplicationSettingsService {
  private apiUrl = `${environment.apiUrl}/application-settings`;

  constructor(private http: HttpClient) {}

  getSettings(type?: 'status'): Observable<ApplicationSetting[]> {
    const url = type ? `${this.apiUrl}?type=${type}` : this.apiUrl;
    return this.http.get<ApplicationSetting[]>(url);
  }

  createSetting(setting: ApplicationSetting): Observable<ApplicationSetting> {
    return this.http.post<ApplicationSetting>(this.apiUrl, setting);
  }

  updateSetting(id: string, setting: Partial<ApplicationSetting>): Observable<ApplicationSetting> {
    return this.http.put<ApplicationSetting>(`${this.apiUrl}/${id}`, setting);
  }

  deleteSetting(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
