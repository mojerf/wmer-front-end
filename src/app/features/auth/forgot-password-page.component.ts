import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { SITE } from '../../core/config/site.config';
import { errorMessage, fieldError } from '../../core/http/api-errors';
import { SeoService } from '../../core/seo/seo.service';
import { FieldComponent } from '../../shared/ui/field/field.component';

@Component({
  selector: 'app-forgot-password-page',
  imports: [ReactiveFormsModule, RouterLink, FieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="wrap grid max-w-[28rem] gap-6 py-[4rem]">
      <header>
        <h1 class="text-[clamp(1.75rem,4vw,2.25rem)] font-black tracking-[-0.02em]">فراموشی رمز عبور</h1>
        <p class="mt-1 text-mut">ایمیلتان را بنویسید تا لینک بازنشانی برایتان ارسال شود.</p>
      </header>

      @if (done()) {
        <p role="status" class="rounded-[1.25rem] border border-line bg-card p-6 leading-[1.9]">{{ done() }}</p>
      } @else {
        <form class="grid gap-4 rounded-[1.75rem] border border-line bg-card p-6" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <app-field label="ایمیل" [error]="emailError()">
            <input class="input-field" type="email" formControlName="email" autocomplete="email" dir="ltr" [attr.aria-invalid]="emailError() ? 'true' : null" />
          </app-field>

          @if (formError()) {
            <p role="alert" class="rounded-[0.875rem] bg-rose/10 px-4 py-3 text-[0.875rem] text-rose">{{ formError() }}</p>
          }

          <button type="submit" class="btn btn-main w-full cursor-pointer" [disabled]="submitting()">
            {{ submitting() ? 'در حال ارسال…' : 'ارسال لینک بازنشانی' }}
          </button>
        </form>
      }

      <a routerLink="/login" class="text-center text-[0.875rem] text-aqua underline-offset-4 hover:underline">بازگشت به ورود</a>
    </section>
  `,
})
export class ForgotPasswordPageComponent {
  private readonly auth = inject(AuthService);

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected readonly submitting = signal(false);
  protected readonly done = signal<string | null>(null);
  protected readonly formError = signal<string | null>(null);
  private readonly serverError = signal<unknown>(null);

  constructor() {
    inject(SeoService).set({
      title: `فراموشی رمز عبور | ${SITE.name}`,
      description: 'بازنشانی رمز عبور',
      noindex: true,
    });
  }

  protected emailError(): string | null {
    const control = this.form.controls.email;
    if (control.touched && control.invalid) {
      return control.hasError('required') ? 'ایمیل را وارد کنید.' : 'ایمیل معتبر نیست.';
    }
    return fieldError(this.serverError(), 'email');
  }

  protected submit(): void {
    this.formError.set(null);
    this.serverError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    this.auth.forgotPassword(this.form.getRawValue().email).subscribe({
      next: (message) => this.done.set(message),
      error: (error: unknown) => {
        this.submitting.set(false);
        this.serverError.set(error);
        this.formError.set(fieldError(error, 'email') ? null : errorMessage(error));
      },
    });
  }
}
