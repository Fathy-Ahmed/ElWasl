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
import { CartService } from '../cart/cart.service';

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
  private readonly cartService = inject(CartService);
  private readonly baseUrl = `${API_CONFIG.baseUrl}/api/v1/Auth`;

  // Token state signal
  readonly accessToken = signal<string | null>(localStorage.getItem('access_token'));

  // Current user state signal
  readonly currentUser = signal<User | null>(this.getStoredUser());
  
  // Computed helpers
  readonly isAuthenticated = computed(() => this.currentUser() !== null && this.accessToken() !== null);
  readonly isAdmin = computed(() => {
    const role = this.currentUser()?.role;
    return role === 'Admin' || role === 'admin';
  });

  constructor() {
    // If a token exists but user profile is not loaded or we want to verify it
    const token = this.accessToken();
    if (token) {
      // Delay execution to let constructor finish and prevent cyclic dependency in interceptors
      setTimeout(() => {
        this.fetchProfile().subscribe({
          error: () => {
            // If profile fetch fails (e.g. token expired), try to refresh token or logout
            this.logout();
          }
        });
      });
    } else {
      // Clear stale user info if token is missing
      if (this.currentUser() !== null) {
        this.currentUser.set(null);
        localStorage.removeItem('user');
        localStorage.removeItem('refresh_token');
      }
      this.cartService.loadUserCart(null);
    }
  }

  login(command: LoginUserCommand): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, command).pipe(
      tap(res => {
        if (res.accessToken) {
          localStorage.setItem('access_token', res.accessToken);
          this.accessToken.set(res.accessToken);
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
        this.cartService.loadUserCart(profile.id);
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
          this.accessToken.set(res.accessToken);
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
    this.accessToken.set(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.cartService.loadUserCart(null);
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
