import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { safeRedirect } from '../../core/auth/safe-redirect';
import { SITE } from '../../core/config/site.config';
import { errorMessage, fieldError } from '../../core/http/api-errors';
import { SeoService } from '../../core/seo/seo.service';
import { FieldComponent } from '../../shared/ui/field/field.component';

const passwordsMatch = (group: AbstractControl): ValidationErrors | null =>
  group.get('password')?.value === group.get('passwordConfirmation')?.value ? null : { mismatch: true };

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink, FieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="wrap grid max-w-[30rem] gap-6 py-[4rem]">
      <header>
        <h1 class="text-[clamp(1.75rem,4vw,2.25rem)] font-black tracking-[-0.02em]">ثبت‌نام</h1>
        <p class="mt-1 text-mut">با چند فیلد ساده حساب بسازید.</p>
      </header>

      <form class="grid gap-4 rounded-[1.75rem] border border-line bg-card p-6" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="grid gap-4 sm:grid-cols-2">
          <app-field label="نام (اختیاری)" [error]="serverMessage('first_name')">
            <input class="input-field" type="text" formControlName="firstName" autocomplete="given-name" />
          </app-field>
          <app-field label="نام خانوادگی (اختیاری)" [error]="serverMessage('last_name')">
            <input class="input-field" type="text" formControlName="lastName" autocomplete="family-name" />
          </app-field>
        </div>

        <app-field label="ایمیل" [error]="emailError()">
          <input class="input-field" type="email" formControlName="email" autocomplete="email" dir="ltr" [attr.aria-invalid]="emailError() ? 'true' : null" />
        </app-field>

        <app-field label="موبایل (اختیاری، مثل 09121234567)" [error]="phoneError()">
          <input class="input-field" type="tel" formControlName="phoneNumber" autocomplete="tel" dir="ltr" [attr.aria-invalid]="phoneError() ? 'true' : null" />
        </app-field>

        <app-field label="رمز عبور (حداقل ۸ نویسه)" [error]="passwordError()">
          <input class="input-field" type="password" formControlName="password" autocomplete="new-password" dir="ltr" [attr.aria-invalid]="passwordError() ? 'true' : null" />
        </app-field>

        <app-field label="تکرار رمز عبور" [error]="confirmError()">
          <input class="input-field" type="password" formControlName="passwordConfirmation" autocomplete="new-password" dir="ltr" />
        </app-field>

        @if (formError()) {
          <p role="alert" class="rounded-[0.875rem] bg-rose/10 px-4 py-3 text-[0.875rem] text-rose">{{ formError() }}</p>
        }

        <button type="submit" class="btn btn-main w-full cursor-pointer" [disabled]="submitting()">
          {{ submitting() ? 'در حال ساخت حساب…' : 'ساخت حساب' }}
        </button>
      </form>

      <p class="text-center text-[0.875rem] text-mut">
        حساب دارید؟
        <a routerLink="/login" [queryParams]="{ redirect: redirect() || null }" class="text-aqua underline-offset-4 hover:underline">ورود</a>
      </p>
    </section>
  `,
})
export class RegisterPageComponent {
  readonly redirect = input<string>();

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      firstName: [''],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^(09\d{9})?$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirmation: ['', [Validators.required]],
    },
    { validators: passwordsMatch },
  );

  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  private readonly serverError = signal<unknown>(null);

  constructor() {
    inject(SeoService).set({
      title: `ثبت‌نام | ${SITE.name}`,
      description: 'ساخت حساب کاربری',
      noindex: true,
    });
  }

  protected serverMessage(field: string): string | null {
    return fieldError(this.serverError(), field);
  }

  protected emailError(): string | null {
    const control = this.form.controls.email;
    if (control.touched && control.hasError('required')) {
      return 'ایمیل را وارد کنید.';
    }
    if (control.touched && control.hasError('email')) {
      return 'ایمیل معتبر نیست.';
    }
    return this.serverMessage('email');
  }

  protected phoneError(): string | null {
    return this.form.controls.phoneNumber.hasError('pattern')
      ? 'شماره باید با ۰۹ شروع شود و ۱۱ رقم باشد.'
      : this.serverMessage('phone_number');
  }

  protected passwordError(): string | null {
    const control = this.form.controls.password;
    if (control.touched && control.hasError('required')) {
      return 'رمز عبور را وارد کنید.';
    }
    if (control.touched && control.hasError('minlength')) {
      return 'رمز عبور دست‌کم ۸ نویسه باشد.';
    }
    return this.serverMessage('password');
  }

  protected confirmError(): string | null {
    const touched = this.form.controls.passwordConfirmation.touched;
    return touched && this.form.hasError('mismatch') ? 'دو رمز عبور یکسان نیستند.' : null;
  }

  protected submit(): void {
    this.formError.set(null);
    this.serverError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => void this.router.navigateByUrl(safeRedirect(this.redirect())),
      error: (error: unknown) => {
        this.submitting.set(false);
        this.serverError.set(error);
        const hasFieldError = ['first_name', 'last_name', 'email', 'phone_number', 'password'].some(
          (field) => fieldError(error, field),
        );
        this.formError.set(hasFieldError ? null : errorMessage(error));
      },
    });
  }
}
