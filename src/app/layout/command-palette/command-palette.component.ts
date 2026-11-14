import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { SITE } from '../../core/config/site.config';
import { ThemeService } from '../../core/theme/theme.service';
import { PaletteService } from './palette.service';

interface Command {
  label: string;
  hint: string;
  run: () => void;
}

@Component({
  selector: 'app-command-palette',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown)': 'onGlobalKey($event)' },
  template: `
    <dialog
      #dialog
      aria-label="پیمایش سریع"
      (close)="palette.hide()"
      (mousedown)="onBackdropClick($event)"
      class="mx-auto mt-[14vh] mb-auto w-[min(35rem,92%)] overflow-hidden rounded-[1.25rem] border border-line bg-card p-0 text-fg shadow-[0_1.875rem_5rem_rgb(0_0_0/0.5)] backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <input
        #search
        type="text"
        role="combobox"
        aria-expanded="true"
        aria-controls="palette-list"
        [attr.aria-activedescendant]="'cmd-' + active()"
        placeholder="به کجا برویم؟ (نمونه‌کارها، وبلاگ، فروشگاه…)"
        autocomplete="off"
        [value]="query()"
        (input)="onInput($event)"
        (keydown)="onInputKey($event)"
        class="w-full border-0 border-b border-line bg-transparent px-[1.375rem] py-[1.125rem] text-[1rem] text-fg outline-none placeholder:text-mut"
      />
      <ul id="palette-list" role="listbox" class="m-0 list-none p-1.5">
        @for (cmd of results(); track cmd.label; let i = $index) {
          <li
            [id]="'cmd-' + i"
            role="option"
            [attr.aria-selected]="i === active()"
            (click)="run(cmd)"
            (keydown.enter)="run(cmd)"
            tabindex="-1"
            (pointerenter)="active.set(i)"
            class="flex cursor-pointer items-center justify-between rounded-[0.75rem] px-4 py-3"
            [class]="i === active() ? 'bg-line text-fg' : 'text-mut'"
          >
            {{ cmd.label }}
            <small class="font-mono text-[0.75rem]" dir="ltr">{{ cmd.hint }}</small>
          </li>
        } @empty {
          <li class="px-4 py-3 text-mut">موردی پیدا نشد.</li>
        }
      </ul>
    </dialog>
  `,
})
export class CommandPaletteComponent {
  protected readonly palette = inject(PaletteService);
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeService);

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly search = viewChild.required<ElementRef<HTMLInputElement>>('search');

  protected readonly query = signal('');
  protected readonly active = signal(0);

  private readonly commands: readonly Command[] = [
    { label: 'نمونه‌کارها', hint: 'G W', run: () => this.goTo('works') },
    { label: 'وبلاگ', hint: 'G B', run: () => this.goTo('blog') },
    { label: 'فروشگاه', hint: 'G S', run: () => this.goTo('shop') },
    { label: 'تماس', hint: 'G C', run: () => this.goTo('contact') },
    { label: 'تغییر تم', hint: 'T', run: () => this.theme.toggle() },
    {
      label: 'سورس‌کد در GitHub',
      hint: 'GitHub',
      run: () => window.open(SITE.github.profile, '_blank', 'noopener,noreferrer'),
    },
  ];

  protected readonly results = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q ? this.commands.filter((c) => c.label.toLowerCase().includes(q)) : this.commands;
  });

  constructor() {
    effect(() => {
      const el = this.dialog().nativeElement;
      if (this.palette.isOpen() && !el.open) {
        this.query.set('');
        this.active.set(0);
        el.showModal();
        this.search().nativeElement.focus();
      } else if (!this.palette.isOpen() && el.open) {
        el.close();
      }
    });
  }

  protected onGlobalKey(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (this.palette.isOpen()) {
        this.palette.hide();
      } else {
        this.palette.show();
      }
    }
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) {
      this.palette.hide();
    }
  }

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.active.set(0);
  }

  protected onInputKey(event: KeyboardEvent): void {
    const count = this.results().length;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.active.update((i) => (count ? (i + 1) % count : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.active.update((i) => (count ? (i - 1 + count) % count : 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const cmd = this.results()[this.active()];
      if (cmd) {
        this.run(cmd);
      }
    }
  }

  protected run(cmd: Command): void {
    this.palette.hide();
    cmd.run();
  }

  private goTo(fragment: string): void {
    void this.router.navigate(['/'], { fragment });
  }
}
