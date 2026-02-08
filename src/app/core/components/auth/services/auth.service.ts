// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../models/response/api-response';
import { LoginRequest } from '../models/request/login-request';
import { Router } from '@angular/router';
import { LoginPhoneRequest } from '../models/request/login-phone-request';
import { AuthState } from '../ngrx/auth.reducer';
import {environment} from '../../../../../environments/environment';
import {Store} from '@ngrx/store';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private router: Router,
    private store: Store<{ auth: AuthState }>
  ) {}

  private getRoles(): string[] {
    const stored = localStorage.getItem('role');
    if (!stored) {
      return [];
    }
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      // Fallback to raw string includes check
      if (typeof stored === 'string' && stored.length) {
        return [stored];
      }
    }
    return [];
  }

  login(payload: LoginRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      environment.userUrl + '/auth/login',
      payload
    );
  }

  loginUsingPhone(payload: LoginPhoneRequest): Observable<any> {
    return this.http.post<any>(environment.userUrl + '/auth/login', payload);
  }

  verifyOtp(payload: any): Observable<any> {
    return this.http.post<any>(
      environment.userUrl + '/auth/verify-otp',
      payload
    );
  }

  private handleError(error: HttpErrorResponse) {
    let message = '';

    if (error.status === 0) {
      message = 'Network connection problem!';
    } else {
      message = error.message;
    }

    return throwError(() => new Error(message));
  }

  logout() {
    localStorage.removeItem('accessToken');
    this.router.navigate(['/auth/login']);
    this.store.dispatch({ type: '[Auth] Logout' });
  }

  isLoggedIn() {
    return localStorage.getItem('accessToken') !== null;
  }

  isAdmin() {
    return this.getRoles().includes('ROLE_SUPERADMIN');
  }

  isCustomerAdmin() {
    return this.getRoles().includes('ROLE_CUSTOMER_ADMIN');
  }
}
