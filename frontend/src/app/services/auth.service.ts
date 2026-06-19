import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';


export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'HR Manager' | 'Interviewer' | 'Candidate';
  avatar?: string;
  phone?: string;
  companyId?: string;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const stored = localStorage.getItem('hireflow_user');
    if (stored) this.currentUserSubject.next(JSON.parse(stored));
  }

  get currentUser(): User | null { return this.currentUserSubject.value; }
  get token(): string | null { return this.currentUser?.token || null; }
  get isLoggedIn(): boolean { return !!this.currentUser; }
  get userRole(): string { return this.currentUser?.role || ''; }

  login(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(user => this.setUser(user))
    );
  }

  register(data: { name: string; email: string; password: string; role?: string }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, data).pipe(
      tap(user => this.setUser(user))
    );
  }

  logout(): void {
    localStorage.removeItem('hireflow_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private setUser(user: User): void {
    localStorage.setItem('hireflow_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  hasRole(...roles: string[]): boolean {
    return roles.includes(this.userRole);
  }
}
