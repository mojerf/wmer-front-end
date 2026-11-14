import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { errorMessage } from '../../core/http/api-errors';
import { FaNumberPipe } from '../../shared/pipes/fa-number.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { ConfirmService } from '../../shared/ui/confirm/confirm.service';
import { AdminApi } from './data-access/admin.api';
import { CONTENT_SCHEMAS, ContentRow, isContentType } from './data-access/admin.models';
import { IconComponent } from '../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-admin-content-list-page',
  imports: [RouterLink, FaNumberPipe, RelativeTimePipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (schema(); as schema) {
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="text-[clamp(1.5rem,3.5vw,2rem)] font-black tracking-[-0.02em]">{{ schema.plural }}</h1>
        <a [routerLink]="['/admin/content', schema.type, 'new']" class="btn btn-main"><app-icon name="plus" /> افزودن {{ schema.singular }}</a>
      </div>

      <input
        class="input-field mt-4 max-w-[24rem]"
        type="search"
        placeholder="جست‌وجو…"
        aria-label="جست‌وجو"
        [value]="search()"
        (input)="onSearch($any($event.target).value)"
      />

      @if (notice()) {
        <p role="status" class="mt-4 rounded-[1rem] bg-card px-4 py-3 text-[0.875rem]">{{ notice() }}</p>
      }

      @if (rows.error()) {
        <p role="alert" class="mt-6 rounded-[1.25rem] bg-rose/10 p-4 text-rose">بارگذاری فهرست ممکن نشد.</p>
      } @else if (rows.value(); as page) {
        <ul class="mt-4 grid gap-2">
          @for (row of page.items; track row.id) {
            <li class="flex items-center justify-between gap-3 rounded-[1.25rem] border border-line bg-card p-3">
              <span class="flex min-w-0 items-center gap-3">
                @if (row.imageUrl) {
                  <img [src]="row.imageUrl" alt="" width="56" height="40" loading="lazy" class="h-[2.5rem] w-[3.5rem] shrink-0 rounded-[0.5rem] object-cover" />
                }
                <span class="min-w-0">
                  <b class="block truncate">{{ row.title }}</b>
                  <span class="text-[0.75rem] text-mut"><bdi dir="ltr">{{ row.slug }}</bdi> · {{ row.createdAt | relativeTime }}</span>
                </span>
              </span>
              <span class="flex shrink-0 items-center gap-2">
                <a [routerLink]="['/admin/content', schema.type, row.id]" class="icon-btn hover:!text-fg" [attr.aria-label]="'ویرایش ' + row.title" title="ویرایش"><app-icon name="edit" /></a>
                <button type="button" class="icon-btn hover:!border-rose hover:!text-rose" [attr.aria-label]="'حذف ' + row.title" title="حذف" (click)="remove(row)"><app-icon name="trash" /></button>
              </span>
            </li>
          } @empty {
            <li class="rounded-[1.25rem] border border-line bg-card p-6 text-center text-mut">موردی پیدا نشد.</li>
          }
        </ul>

        @if (page.lastPage > 1) {
          <nav class="mt-6 flex items-center justify-center gap-3" aria-label="صفحه‌بندی">
            <button type="button" class="btn cursor-pointer" [disabled]="page.page <= 1" (click)="go(page.page - 1)"><app-icon name="arrow-back" /> قبلی</button>
            <span class="text-[0.875rem] text-mut">صفحه‌ی {{ page.page | faNumber }} از {{ page.lastPage | faNumber }}</span>
            <button type="button" class="btn cursor-pointer" [disabled]="page.page >= page.lastPage" (click)="go(page.page + 1)">بعدی</button>
          </nav>
        }
      } @else {
        <p role="status" class="mt-6 text-mut">در حال بارگذاری…</p>
      }
    }
  `,
})
export class AdminContentListPageComponent {
  /** The `:type` route parameter, through component input binding. */
  readonly type = input<string>();

  private readonly api = inject(AdminApi);
  private readonly confirm = inject(ConfirmService);

  protected readonly schema = computed(() => {
    const type = this.type();
    return isContentType(type) ? CONTENT_SCHEMAS[type] : null;
  });

  protected readonly search = signal('');
  protected readonly notice = signal<string | null>(null);
  private readonly pageNumber = signal(1);
  private readonly refreshKey = signal(0);
  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  protected readonly rows = rxResource({
    params: () => {
      const schema = this.schema();
      return schema
        ? { type: schema.type, page: this.pageNumber(), search: this.search(), key: this.refreshKey() }
        : undefined;
    },
    stream: ({ params }) => this.api.list(params.type, params.page, params.search),
  });

  protected onSearch(value: string): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.search.set(value.trim());
      this.pageNumber.set(1);
    }, 250);
  }

  protected go(page: number): void {
    this.pageNumber.set(page);
  }

  protected async remove(row: ContentRow): Promise<void> {
    const schema = this.schema();
    if (!schema) {
      return;
    }
    const confirmed = await this.confirm.ask({
      title: `«${row.title}» حذف شود؟`,
      message: 'این کار قابل بازگشت نیست.',
      confirmLabel: 'حذف',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    this.api.remove(schema.type, row.id).subscribe({
      next: () => {
        this.notice.set('حذف شد.');
        this.refreshKey.update((n) => n + 1);
      },
      error: (error: unknown) => this.notice.set(errorMessage(error)),
    });
  }
}
