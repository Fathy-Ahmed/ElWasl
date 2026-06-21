import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { 
  AuthResponse, 
  LoginUserCommand, 
  RegisterUserCommand, 
  CurrentUserDto, 
  Language 
} from '../models/api.models';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.baseUrl}/api/v1/Auth`;

  // Current user state signal
  readonly currentUser = signal<User | null>(this.getStoredUser());
  
  // Computed helpers
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => {
    const role = this.currentUser()?.role;
    return role === 'Admin' || role === 'admin';
  });

  constructor() {
    // If a token exists but user profile is not loaded or we want to verify it
    const token = localStorage.getItem('access_token');
    if (token) {
      this.fetchProfile().subscribe({
        error: () => {
          // If profile fetch fails (e.g. token expired), try to refresh token or logout
          this.logout();
        }
      });
    }
  }

  login(command: LoginUserCommand): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, command).pipe(
      tap(res => {
        if (res.accessToken) {
          localStorage.setItem('access_token', res.accessToken);
        }
        if (res.refreshToken) {
          localStorage.setItem('refresh_token', res.refreshToken);
        }
        
        const user: User = {
          id: '', // Will be updated by profile fetch or from JWT decode if needed
          name: res.fullName || res.email || 'User',
          email: res.email || '',
          role: res.role || 'User'
        };
        
        this.currentUser.set(user);
        localStorage.setItem('user', JSON.stringify(user));
      }),
      // Immediately fetch complete profile info to obtain User ID
      tap(() => {
        this.fetchProfile().subscribe();
      })
    );
  }

  register(command: RegisterUserCommand): Observable<any> {
    // Set default preferred language to Arabic if not specified
    if (!command.preferredLanguage) {
      command.preferredLanguage = Language.Arabic;
    }
    return this.http.post<any>(`${this.baseUrl}/register`, command);
  }

  fetchProfile(): Observable<CurrentUserDto> {
    return this.http.get<CurrentUserDto>(`${this.baseUrl}/me`).pipe(
      tap(profile => {
        const user: User = {
          id: profile.id,
          name: profile.fullName || profile.email || 'User',
          email: profile.email || '',
          role: profile.role || 'User'
        };
        this.currentUser.set(user);
        localStorage.setItem('user', JSON.stringify(user));
      })
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return of({});
    }

    return this.http.post<AuthResponse>(`${this.baseUrl}/refresh`, { refreshToken }).pipe(
      tap(res => {
        if (res.accessToken) {
          localStorage.setItem('access_token', res.accessToken);
        }
        if (res.refreshToken) {
          localStorage.setItem('refresh_token', res.refreshToken);
        }
      }),
      catchError(err => {
        this.logout();
        throw err;
      })
    );
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  private getStoredUser(): User | null {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        return JSON.parse(stored) as User;
      } catch {
        return null;
      }
    }
    return null;
  }
}
