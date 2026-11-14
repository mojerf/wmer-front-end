import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { errorMessage } from '../../core/http/api-errors';

/** Reminds signed-in users with an unconfirmed e-mail address (they cannot buy or comment until then). */
@Component({
  selector: 'app-verify-email-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div role="status" class="wrap mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-line bg-card px-4 py-3 text-[0.875rem]">
        <p>
          ایمیل <bdi dir="ltr">{{ auth.user()?.email }}</bdi> هنوز تأیید نشده است؛ برای خرید و نوشتن نظر، لینک ارسال‌شده را باز کنید.
        </p>
        <span class="flex items-center gap-3">
          @if (message()) {
            <span class="text-mut">{{ message() }}</span>
          }
          <button type="button" class="cursor-pointer text-aqua underline-offset-4 hover:underline" [disabled]="sending()" (click)="resend()">
            {{ sending() ? 'در حال ارسال…' : 'ارسال دوباره‌ی لینک' }}
          </button>
        </span>
      </div>
    }
  `,
})
export class VerifyEmailBannerComponent {
  protected readonly auth = inject(AuthService);

  protected readonly visible = computed(() => {
    const user = this.auth.user();
    return user !== null && !user.emailVerified;
  });

  protected readonly sending = signal(false);
  protected readonly message = signal<string | null>(null);

  protected resend(): void {
    this.sending.set(true);
    this.message.set(null);

    this.auth.resendVerification().subscribe({
      next: (message) => {
        this.sending.set(false);
        this.message.set(message);
      },
      error: (error: unknown) => {
        this.sending.set(false);
        this.message.set(errorMessage(error));
      },
    });
  }
}
