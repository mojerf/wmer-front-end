import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SITE } from '../../core/config/site.config';
import { errorMessage, fieldError } from '../../core/http/api-errors';
import { SeoService } from '../../core/seo/seo.service';
import { FieldComponent } from '../../shared/ui/field/field.component';
import { ContactApi } from './data-access/contact.api';

@Component({
  selector: 'app-contact-page',
  imports: [ReactiveFormsModule, RouterLink, FieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="wrap max-w-[40rem] pt-[3.5rem] pb-10">
      <h1 class="text-[clamp(2rem,5vw,3.25rem)] leading-[1.3] font-black tracking-[-0.03em]">
        <span class="text-shimmer">تماس</span> با من
      </h1>
      <p class="mt-2 max-w-[34rem] text-mut">پروژه یا سؤالی دارید؟ پیامتان را بنویسید؛ معمولاً همان روز جواب می‌دهم.</p>

      @if (done()) {
        <div role="status" class="mt-8 rounded-[1.5rem] border border-line bg-card p-6 leading-[1.9]">
          <p class="font-bold">پیامتان ارسال شد.</p>
          <p class="mt-1 text-mut">ممنون! به‌زودی با شما تماس می‌گیرم.</p>
          <a routerLink="/" class="btn mt-4">بازگشت به خانه</a>
        </div>
      } @else {
        <form class="mt-8 grid gap-4 rounded-[1.75rem] border border-line bg-card p-6" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <app-field label="ایمیل" [error]="emailError()">
            <input class="input-field" type="email" formControlName="email" autocomplete="email" dir="ltr" [attr.aria-invalid]="emailError() ? 'true' : null" />
          </app-field>

          <app-field label="تلفن (اختیاری)" [error]="phoneError()">
            <input class="input-field" type="tel" formControlName="phoneNumber" autocomplete="tel" dir="ltr" [attr.aria-invalid]="phoneError() ? 'true' : null" />
          </app-field>

          <app-field label="موضوع" [error]="titleError()">
            <input class="input-field" type="text" formControlName="title" maxlength="255" [attr.aria-invalid]="titleError() ? 'true' : null" />
          </app-field>

          <app-field label="پیام" [error]="textError()">
            <textarea class="input-field" rows="6" formControlName="text" maxlength="5000" [attr.aria-invalid]="textError() ? 'true' : null"></textarea>
          </app-field>

          @if (formError()) {
            <p role="alert" class="rounded-[0.875rem] bg-rose/10 px-4 py-3 text-[0.875rem] text-rose">{{ formError() }}</p>
          }

          <button type="submit" class="btn btn-main w-full cursor-pointer" [disabled]="submitting()">
            {{ submitting() ? 'در حال ارسال…' : 'ارسال پیام' }}
          </button>
        </form>
      }
    </section>
  `,
})
export class ContactPageComponent {
  private readonly api = inject(ContactApi);

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    phoneNumber: ['', [Validators.pattern(/^([0-9\s\-+()]{10,30})?$/)]],
    title: ['', [Validators.required, Validators.maxLength(255)]],
    text: ['', [Validators.required, Validators.maxLength(5000)]],
  });

  protected readonly submitting = signal(false);
  protected readonly done = signal(false);
  protected readonly formError = signal<string | null>(null);
  private readonly serverError = signal<unknown>(null);

  constructor() {
    inject(SeoService).set({
      title: `تماس | ${SITE.name}`,
      description: 'برای همکاری، مشاوره یا هر سؤالی با من در تماس باشید.',
      path: '/contact',
    });
  }

  protected emailError(): string | null {
    const control = this.form.controls.email;
    if (control.touched && control.hasError('required')) {
      return 'ایمیل را وارد کنید.';
    }
    if (control.touched && control.invalid) {
      return 'ایمیل معتبر نیست.';
    }
    return fieldError(this.serverError(), 'email');
  }

  protected phoneError(): string | null {
    return this.form.controls.phoneNumber.hasError('pattern')
      ? 'شماره باید ۱۰ تا ۳۰ نویسه (رقم، فاصله، + و -) باشد.'
      : fieldError(this.serverError(), 'phone_number');
  }

  protected titleError(): string | null {
    const control = this.form.controls.title;
    return control.touched && control.hasError('required')
      ? 'موضوع را بنویسید.'
      : fieldError(this.serverError(), 'title');
  }

  protected textError(): string | null {
    const control = this.form.controls.text;
    return control.touched && control.hasError('required')
      ? 'متن پیام را بنویسید.'
      : fieldError(this.serverError(), 'text');
  }

  protected submit(): void {
    this.formError.set(null);
    this.serverError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    this.api.send(this.form.getRawValue()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.done.set(true);
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        this.serverError.set(error);
        const hasFieldError = ['email', 'phone_number', 'title', 'text'].some((f) => fieldError(error, f));
        this.formError.set(hasFieldError ? null : errorMessage(error));
      },
    });
  }
}
