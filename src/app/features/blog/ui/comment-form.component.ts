import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { errorMessage, fieldError } from '../../../core/http/api-errors';
import { FieldComponent } from '../../../shared/ui/field/field.component';
import { BlogApi } from '../data-access/blog.api';
import { PostComment } from '../data-access/blog.models';

/** Write a comment (or a reply). Only signed-in users can; everyone else is invited to sign in. */
@Component({
  selector: 'app-comment-form',
  imports: [ReactiveFormsModule, RouterLink, FieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (auth.isLoggedIn()) {
      <form class="grid gap-3 rounded-[1.25rem] border border-line bg-card p-4" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        @if (replyTo(); as target) {
          <p class="flex items-center justify-between text-[0.8125rem] text-mut">
            <span>پاسخ به {{ target.authorName }}</span>
            <button type="button" class="cursor-pointer hover:text-fg" (click)="cancelReply.emit()">لغو</button>
          </p>
        }

        <app-field [label]="replyTo() ? 'پاسخ شما' : 'نظر شما'" [error]="bodyError()">
          <textarea class="input-field" rows="4" formControlName="body" maxlength="2000" [attr.aria-invalid]="bodyError() ? 'true' : null"></textarea>
        </app-field>

        @if (formError()) {
          <p role="alert" class="text-[0.8125rem] text-rose">{{ formError() }}</p>
        }

        <div>
          <button type="submit" class="btn btn-main cursor-pointer" [disabled]="submitting()">
            {{ submitting() ? 'در حال ارسال…' : 'ثبت' }}
          </button>
        </div>
      </form>
    } @else {
      <p class="rounded-[1.25rem] border border-line bg-card p-5 text-[0.9375rem] text-mut">
        برای نوشتن نظر
        <a routerLink="/login" [queryParams]="{ redirect: router.url }" class="text-aqua underline-offset-4 hover:underline">وارد شوید</a>
        یا
        <a routerLink="/register" [queryParams]="{ redirect: router.url }" class="text-aqua underline-offset-4 hover:underline">ثبت‌نام کنید</a>.
      </p>
    }
  `,
})
export class CommentFormComponent {
  /** Slug of the post being commented on. */
  readonly slug = input.required<string>();
  /** When set, the comment is a reply to this (top-level) comment. */
  readonly replyTo = input<PostComment | null>(null);

  readonly posted = output<void>();
  readonly cancelReply = output<void>();

  protected readonly auth = inject(AuthService);
  protected readonly router = inject(Router);
  private readonly api = inject(BlogApi);

  protected readonly form = inject(NonNullableFormBuilder).group({
    body: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2000)]],
  });

  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  private readonly serverError = signal<unknown>(null);

  protected bodyError(): string | null {
    const control = this.form.controls.body;
    if (control.touched && control.invalid) {
      return control.hasError('required') ? 'متن نظر را بنویسید.' : 'نظر دست‌کم ۲ نویسه باشد.';
    }
    return fieldError(this.serverError(), 'body');
  }

  protected submit(): void {
    this.formError.set(null);
    this.serverError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    this.api.addComment(this.slug(), this.form.getRawValue().body.trim(), this.replyTo()?.id ?? null).subscribe({
      next: () => {
        this.submitting.set(false);
        this.form.reset();
        this.posted.emit();
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        this.serverError.set(error);
        this.formError.set(
          fieldError(error, 'body') || fieldError(error, 'parent_id') ? null : errorMessage(error),
        );
      },
    });
  }
}
