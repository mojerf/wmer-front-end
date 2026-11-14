import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { SITE } from '../../core/config/site.config';
import { errorMessage, fieldError } from '../../core/http/api-errors';
import { SeoService } from '../../core/seo/seo.service';
import { FieldComponent } from '../../shared/ui/field/field.component';

const passwordsMatch = (group: AbstractControl): ValidationErrors | null =>
  group.get('password')?.value === group.get('passwordConfirmation')?.value ? null : { mismatch: true };

/** Opened from the e-mailed link: /reset-password?token=…&email=… */
@Component({
  selector: 'app-reset-password-page',
  imports: [ReactiveFormsModule, RouterLink, FieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="wrap grid max-w-[28rem] gap-6 py-[4rem]">
      <header>
        <h1 class="text-[clamp(1.75rem,4vw,2.25rem)] font-black tracking-[-0.02em]">رمز عبور جدید</h1>
        <p class="mt-1 text-mut">یک رمز عبور تازه برای حسابتان انتخاب کنید.</p>
      </header>

      @if (done()) {
        <p role="status" class="rounded-[1.25rem] border border-line bg-card p-6 leading-[1.9]">{{ done() }}</p>
        <a routerLink="/login" class="btn btn-main">ورود با رمز جدید</a>
      } @else if (!token() || !email()) {
        <p role="alert" class="rounded-[1.25rem] border border-line bg-card p-6 leading-[1.9]">
          این لینک ناقص است. از صفحه‌ی «فراموشی رمز عبور» دوباره درخواست بدهید.
        </p>
        <a routerLink="/forgot-password" class="btn">فراموشی رمز عبور</a>
      } @else {
        <form class="grid gap-4 rounded-[1.75rem] border border-line bg-card p-6" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <p class="text-[0.875rem] text-mut" dir="ltr">{{ email() }}</p>

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
            {{ submitting() ? 'در حال ذخیره…' : 'ذخیره‌ی رمز جدید' }}
          </button>
        </form>
      }
    </section>
  `,
})
export class ResetPasswordPageComponent {
  /** From the query string, through component input binding. */
  readonly token = input<string>();
  readonly email = input<string>();

  private readonly auth = inject(AuthService);

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirmation: ['', [Validators.required]],
    },
    { validators: passwordsMatch },
  );

  protected readonly submitting = signal(false);
  protected readonly done = signal<string | null>(null);
  protected readonly formError = signal<string | null>(null);
  private readonly serverError = signal<unknown>(null);

  constructor() {
    inject(SeoService).set({
      title: `رمز عبور جدید | ${SITE.name}`,
      description: 'تعیین رمز عبور جدید',
      noindex: true,
    });
  }

  protected passwordError(): string | null {
    const control = this.form.controls.password;
    if (control.touched && control.hasError('required')) {
      return 'رمز عبور را وارد کنید.';
    }
    if (control.touched && control.hasError('minlength')) {
      return 'رمز عبور دست‌کم ۸ نویسه باشد.';
    }
    return fieldError(this.serverError(), 'password');
  }

  protected confirmError(): string | null {
    return this.form.controls.passwordConfirmation.touched && this.form.hasError('mismatch')
      ? 'دو رمز عبور یکسان نیستند.'
      : null;
  }

  protected submit(): void {
    this.formError.set(null);
    this.serverError.set(null);

    const token = this.token();
    const email = this.email();
    if (this.form.invalid || !token || !email) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const { password, passwordConfirmation } = this.form.getRawValue();

    this.auth.resetPassword({ token, email, password, passwordConfirmation }).subscribe({
      next: (message) => this.done.set(message),
      error: (error: unknown) => {
        this.submitting.set(false);
        this.serverError.set(error);
        // An invalid/expired token is reported by the API on the "email" field.
        this.formError.set(fieldError(error, 'password') ? null : (fieldError(error, 'email') ?? errorMessage(error)));
      },
    });
  }
}
