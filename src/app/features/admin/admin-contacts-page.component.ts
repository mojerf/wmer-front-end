import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { errorMessage } from '../../core/http/api-errors';
import { FaNumberPipe } from '../../shared/pipes/fa-number.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { AdminApi } from './data-access/admin.api';
import { AdminContact } from './data-access/admin.models';
import { IconComponent } from '../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-admin-contacts-page',
  imports: [FaNumberPipe, RelativeTimePipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="text-[clamp(1.5rem,3.5vw,2rem)] font-black tracking-[-0.02em]">پیام‌ها</h1>

    @if (notice()) {
      <p role="status" class="mt-4 rounded-[1rem] bg-card px-4 py-3 text-[0.875rem]">{{ notice() }}</p>
    }

    @if (contacts.error()) {
      <p role="alert" class="mt-6 rounded-[1.25rem] bg-rose/10 p-4 text-rose">بارگذاری پیام‌ها ممکن نشد.</p>
    } @else if (contacts.value(); as page) {
      <ul class="mt-4 grid gap-2">
        @for (contact of page.items; track contact.id) {
          <li class="grid gap-1 rounded-[1.25rem] border border-line bg-card p-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <b>{{ contact.title }}</b>
              <button type="button" class="icon-btn hover:!border-rose hover:!text-rose" aria-label="حذف پیام" title="حذف" (click)="remove(contact)"><app-icon name="trash" /></button>
            </div>
            <p class="text-[0.8125rem] text-mut">
              <bdi dir="ltr">{{ contact.email }}</bdi>
              @if (contact.phoneNumber) {
                · <bdi dir="ltr">{{ contact.phoneNumber }}</bdi>
              }
              · {{ contact.createdAt | relativeTime }}
            </p>
            <p class="leading-[1.9] whitespace-pre-line">{{ contact.text }}</p>
          </li>
        } @empty {
          <li class="rounded-[1.25rem] border border-line bg-card p-6 text-center text-mut">پیامی وجود ندارد.</li>
        }
      </ul>

      @if (page.lastPage > 1) {
        <nav class="mt-6 flex items-center justify-center gap-3" aria-label="صفحه‌بندی">
          <button type="button" class="btn cursor-pointer" [disabled]="page.page <= 1" (click)="pageNumber.set(page.page - 1)"><app-icon name="arrow-back" /> قبلی</button>
          <span class="text-[0.875rem] text-mut">صفحه‌ی {{ page.page | faNumber }} از {{ page.lastPage | faNumber }}</span>
          <button type="button" class="btn cursor-pointer" [disabled]="page.page >= page.lastPage" (click)="pageNumber.set(page.page + 1)">بعدی</button>
        </nav>
      }
    } @else {
      <p role="status" class="mt-6 text-mut">در حال بارگذاری…</p>
    }
  `,
})
export class AdminContactsPageComponent {
  private readonly api = inject(AdminApi);

  protected readonly notice = signal<string | null>(null);
  protected readonly pageNumber = signal(1);
  private readonly refreshKey = signal(0);

  protected readonly contacts = rxResource({
    params: () => ({ page: this.pageNumber(), key: this.refreshKey() }),
    stream: ({ params }) => this.api.contacts(params.page),
  });

  protected remove(contact: AdminContact): void {
    if (!confirm('این پیام حذف شود؟')) {
      return;
    }
    this.api.removeContact(contact.id).subscribe({
      next: () => {
        this.notice.set('پیام حذف شد.');
        this.refreshKey.update((n) => n + 1);
      },
      error: (error: unknown) => this.notice.set(errorMessage(error)),
    });
  }
}
