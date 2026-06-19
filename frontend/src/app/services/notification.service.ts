import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  getUnreadCount(): void {
    this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`).subscribe(
      res => this.unreadCountSubject.next(res.count)
    );
  }
  markAsRead(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => this.getUnreadCount())
    );
  }
  markAllAsRead(): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => this.unreadCountSubject.next(0))
    );
  }
}
