import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, shareReplay, tap } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';

export interface User {
  firstName: string | null;
  lastName: string | null;
  email: string;
  emailVerified: boolean;
  phoneNumber: string | null;
  role: 'admin' | 'user';
}

interface UserDto {
  first_name: string | null;
  last_name: string | null;
  email: string;
  email_verified?: boolean;
  phone_number: string | null;
  role: 'admin' | 'user';
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  passwordConfirmation: string;
}

const toUser = (dto: UserDto): User => ({
  firstName: dto.first_name,
  lastName: dto.last_name,
  email: dto.email,
  emailVerified: dto.email_verified ?? false,
  phoneNumber: dto.phone_number,
  role: dto.role,
});

/**
 * Session state for Sanctum's cookie-based SPA authentication. No token is ever stored in JavaScript:
 * the session lives in an HTTP-only cookie, this service only mirrors "who is signed in".
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(APP_CONFIG).apiUrl;

  private readonly current = signal<User | null>(null);
  private restore$?: Observable<User | null>;

  readonly user = this.current.asReadonly();
  readonly isLoggedIn = computed(() => this.current() !== null);
  readonly isAdmin = computed(() => this.current()?.role === 'admin');
  readonly displayName = computed(() => {
    const user = this.current();
    if (!user) {
      return '';
    }
    return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || (user.email.split('@')[0] ?? '');
  });

  /** Asks the API who is signed in (once). A 401 simply means nobody. */
  restore(): Observable<User | null> {
    this.restore$ ??= this.http.get<{ data: UserDto }>(`${this.api}/me`).pipe(
      map((res) => toUser(res.data)),
      catchError(() => of(null)),
      tap((user) => this.current.set(user)),
      shareReplay(1),
    );
    return this.restore$;
  }

  /** Re-reads the signed-in user from the API (e.g. after confirming the e-mail address). */
  refresh(): Observable<User | null> {
    this.restore$ = undefined;
    return this.restore();
  }

  /** Confirms an e-mail address from the link's parameters (works without being signed in). */
  verifyEmail(link: { id: string; hash: string; expires: string; signature: string }): Observable<string> {
    const query = new HttpParams().set('expires', link.expires).set('signature', link.signature);
    return this.http
      .post<{ message: string }>(
        `${this.api}/email/verify/${encodeURIComponent(link.id)}/${encodeURIComponent(link.hash)}`,
        {},
        { params: query },
      )
      .pipe(map((res) => res.message));
  }

  resendVerification(): Observable<string> {
    return this.http
      .post<{ message: string }>(`${this.api}/email/verification-notification`, {})
      .pipe(map((res) => res.message));
  }

  login(email: string, password: string): Observable<User> {
    return this.http
      .post<{ user: UserDto }>(`${this.api}/login`, { email, password })
      .pipe(this.signIn());
  }

  register(payload: RegisterPayload): Observable<User> {
    return this.http
      .post<{ user: UserDto }>(`${this.api}/register`, {
        first_name: payload.firstName || null,
        last_name: payload.lastName || null,
        email: payload.email,
        phone_number: payload.phoneNumber || null,
        password: payload.password,
        password_confirmation: payload.passwordConfirmation,
      })
      .pipe(this.signIn());
  }

  logout(): Observable<void> {
    return this.http.post(`${this.api}/logout`, {}).pipe(
      // Whatever the server says, this browser is signed out afterwards.
      catchError(() => of(null)),
      tap(() => this.reset()),
      map(() => undefined),
    );
  }

  forgotPassword(email: string): Observable<string> {
    return this.http
      .post<{ message: string }>(`${this.api}/forgot-password`, { email })
      .pipe(map((res) => res.message));
  }

  resetPassword(payload: { token: string; email: string; password: string; passwordConfirmation: string }): Observable<string> {
    return this.http
      .post<{ message: string }>(`${this.api}/reset-password`, {
        token: payload.token,
        email: payload.email,
        password: payload.password,
        password_confirmation: payload.passwordConfirmation,
      })
      .pipe(map((res) => res.message));
  }

  private signIn() {
    return (source: Observable<{ user: UserDto }>): Observable<User> =>
      source.pipe(
        map((res) => toUser(res.user)),
        tap((user) => {
          this.current.set(user);
          this.restore$ = of(user);
        }),
      );
  }

  private reset(): void {
    this.current.set(null);
    this.restore$ = of(null);
  }
}
