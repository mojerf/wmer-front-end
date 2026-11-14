import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE } from '../../core/config/site.config';
import { IconComponent } from '../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-site-footer',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer
      class="wrap relative z-[1] flex flex-wrap items-center justify-between gap-4 pt-[3.125rem] pb-10 text-[0.8125rem] text-mut"
    >
      <span>© {{ year }} {{ site.name }}</span>
      <span class="inline-flex flex-wrap items-center gap-2.5">
        ساخته‌شده با <span class="text-rose" aria-label="عشق">♥</span> و کاملاً متن‌باز:
        <a
          [href]="site.github.frontEnd"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-fg transition hover:-translate-y-0.5 hover:border-iris"
        >
          <app-icon name="github" />Angular
        </a>
        <a
          [href]="site.github.backEnd"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-fg transition hover:-translate-y-0.5 hover:border-iris"
        >
          <app-icon name="github" />Laravel
        </a>
      </span>
    </footer>
  `,
})
export class SiteFooterComponent {
  protected readonly site = SITE;
  protected readonly year = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric',
  }).format(new Date());
}
