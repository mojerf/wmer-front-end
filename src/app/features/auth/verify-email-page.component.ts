import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { distinctUntilChanged, filter } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { SITE } from '../../core/config/site.config';
import { errorMessage } from '../../core/http/api-errors';
import { SeoService } from '../../core/seo/seo.service';

/** Opened from the confirmation e-mail: /verify-email?id=…&hash=…&expires=…&signature=… */
@Component({
  selector: 'app-verify-email-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="wrap grid max-w-[28rem] gap-6 py-[4rem]">
      <h1 class="text-[clamp(1.75rem,4vw,2.25rem)] font-black tracking-[-0.02em]">تأیید ایمیل</h1>

      @if (state() === 'working') {
        <p role="status" class="rounded-[1.25rem] border border-line bg-card p-6 text-mut">در حال تأیید ایمیل…</p>
      } @else if (state() === 'done') {
        <p role="status" class="rounded-[1.25rem] bg-emerald-500/10 p-6 leading-[1.9] text-emerald-700 dark:text-emerald-300">{{ message() }}</p>
        <a routerLink="/" class="btn btn-main">ادامه</a>
      } @else {
        <p role="alert" class="rounded-[1.25rem] bg-rose/10 p-6 leading-[1.9] text-rose">{{ message() }}</p>
        <p class="text-[0.875rem] text-mut">لینک ممکن است منقضی شده باشد. وارد شوید و از نوار بالای صفحه لینک تازه بگیرید.</p>
        <a routerLink="/login" class="btn">ورود</a>
      }
    </section>
  `,
})
export class VerifyEmailPageComponent {
  /** The link's query parameters, through component input binding. */
  readonly id = input<string>();
  readonly hash = input<string>();
  readonly expires = input<string>();
  readonly signature = input<string>();

  private readonly auth = inject(AuthService);

  protected readonly state = signal<'working' | 'done' | 'failed'>('working');
  protected readonly message = signal('');

  constructor() {
    inject(SeoService).set({
      title: `تأیید ایمیل | ${SITE.name}`,
      description: 'تأیید نشانی ایمیل',
      noindex: true,
    });

    // Runs once, when the link's parameters are available.
    toObservable(this.signature)
      .pipe(
        filter((signature): signature is string => !!signature),
        distinctUntilChanged(),
      )
      .subscribe(() => this.verify());
  }

  private verify(): void {
    const [id, hash, expires, signature] = [this.id(), this.hash(), this.expires(), this.signature()];

    if (!id || !hash || !expires || !signature) {
      this.fail('این لینک ناقص است.');
      return;
    }

    this.auth.verifyEmail({ id, hash, expires, signature }).subscribe({
      next: (message) => {
        this.message.set(message);
        this.state.set('done');
        // If this browser is signed in, its copy of the user must learn about the confirmation.
        this.auth.refresh().subscribe();
      },
      error: (error: unknown) => this.fail(errorMessage(error)),
    });
  }

  private fail(message: string): void {
    this.message.set(message);
    this.state.set('failed');
  }
}
