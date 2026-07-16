import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { AuthResponse, LoginRequest, RefreshTokenResponse, RegisterRequest, UserResponse } from '../models/user.model';
import { finalize, map, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private refreshRequest$: Observable<string> | null = null;

  currentUser = signal<UserResponse | null>(null);

  constructor() {
    const saved = localStorage.getItem('user');
    if (saved) {
      this.currentUser.set(JSON.parse(saved));
    }
  }

  register(body: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/auth/register`, body).pipe(
      tap(res => this.saveSession(res))
    );
  }

  login(body: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/auth/login`, body).pipe(
      tap(res => this.saveSession(res))
    );
  }

  me(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${API}/auth/me`).pipe(
      tap(user => {
        this.currentUser.set(user);
        localStorage.setItem('user', JSON.stringify(user));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  setCurrentUser(user: UserResponse): void {
    this.currentUser.set(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  refreshSession(): Observable<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available.'));
    }

    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }

    this.refreshRequest$ = this.http
      .post<RefreshTokenResponse>(`${API}/auth/refresh`, { refreshToken })
      .pipe(
        tap(res => this.saveSession(res)),
        map(res => res.token),
        finalize(() => {
          this.refreshRequest$ = null;
        }),
        shareReplay(1)
      );

    return this.refreshRequest$;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  private saveSession(res: AuthResponse | RefreshTokenResponse): void {
    localStorage.setItem('token', res.token);
    if (res.refreshToken) {
      localStorage.setItem('refreshToken', res.refreshToken);
    }
    if (res.user) {
      this.setCurrentUser(res.user);
    }
  }
}
