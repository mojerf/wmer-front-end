import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { safeRedirect } from '../../core/auth/safe-redirect';
import { SITE } from '../../core/config/site.config';
import { errorMessage, fieldError } from '../../core/http/api-errors';
import { SeoService } from '../../core/seo/seo.service';
import { FieldComponent } from '../../shared/ui/field/field.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink, FieldComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="wrap grid max-w-[28rem] gap-6 py-[4rem]">
      <header>
        <h1 class="text-[clamp(1.75rem,4vw,2.25rem)] font-black tracking-[-0.02em]">ورود</h1>
        <p class="mt-1 text-mut">برای نوشتن نظر و دیدن سفارش‌هایتان وارد شوید.</p>
      </header>

      <form class="grid gap-4 rounded-[1.75rem] border border-line bg-card p-6" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <app-field label="ایمیل" [error]="emailError()">
          <input class="input-field" type="email" formControlName="email" autocomplete="email" dir="ltr" [attr.aria-invalid]="emailError() ? 'true' : null" />
        </app-field>

        <app-field label="رمز عبور" [error]="passwordError()">
          <input class="input-field" type="password" formControlName="password" autocomplete="current-password" dir="ltr" [attr.aria-invalid]="passwordError() ? 'true' : null" />
        </app-field>

        @if (formError()) {
          <p role="alert" class="rounded-[0.875rem] bg-rose/10 px-4 py-3 text-[0.875rem] text-rose">{{ formError() }}</p>
        }

        <button type="submit" class="btn btn-main w-full cursor-pointer" [disabled]="submitting()">
          <app-icon name="login" />
          {{ submitting() ? 'در حال ورود…' : 'ورود' }}
        </button>

        <a routerLink="/forgot-password" class="text-center text-[0.8125rem] text-mut hover:text-fg">رمز عبورتان را فراموش کرده‌اید؟</a>
      </form>

      <p class="text-center text-[0.875rem] text-mut">
        حساب ندارید؟
        <a routerLink="/register" [queryParams]="{ redirect: redirect() || null }" class="text-aqua underline-offset-4 hover:underline">ثبت‌نام</a>
      </p>
    </section>
  `,
})
export class LoginPageComponent {
  /** `?redirect=/some/path`: where to go after signing in (in-app paths only). */
  readonly redirect = input<string>();

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  private readonly serverError = signal<unknown>(null);

  constructor() {
    inject(SeoService).set({
      title: `ورود | ${SITE.name}`,
      description: 'ورود به حساب کاربری',
      noindex: true,
    });
  }

  protected emailError(): string | null {
    const control = this.form.controls.email;
    if (control.touched && control.hasError('required')) {
      return 'ایمیل را وارد کنید.';
    }
    if (control.touched && control.hasError('email')) {
      return 'ایمیل معتبر نیست.';
    }
    return fieldError(this.serverError(), 'email');
  }

  protected passwordError(): string | null {
    const control = this.form.controls.password;
    return control.touched && control.hasError('required')
      ? 'رمز عبور را وارد کنید.'
      : fieldError(this.serverError(), 'password');
  }

  protected submit(): void {
    this.formError.set(null);
    this.serverError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const { email, password } = this.form.getRawValue();

    this.auth.login(email, password).subscribe({
      next: () => void this.router.navigateByUrl(safeRedirect(this.redirect())),
      error: (error: unknown) => {
        this.submitting.set(false);
        this.serverError.set(error);
        // Field errors are shown next to their inputs; anything else goes in the banner.
        this.formError.set(fieldError(error, 'email') || fieldError(error, 'password') ? null : errorMessage(error));
      },
    });
  }
}
