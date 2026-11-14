import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, viewChild } from '@angular/core';
import { ConfirmService } from './confirm.service';

/**
 * Renders the dialog for `ConfirmService`. It uses the platform `<dialog>` element, so the browser provides
 * the focus trap, the backdrop, Escape to cancel and focus restoration.
 */
@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog
      #dialog
      class="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-[1.5rem] border border-line bg-bg p-6 text-fg shadow-[0_2rem_4rem_-1rem_rgb(0_0_0/0.45)] backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      aria-labelledby="confirm-title"
      [attr.aria-describedby]="confirm.pending()?.message ? 'confirm-message' : null"
      (cancel)="answer(false, $event)"
    >
      @if (confirm.pending(); as q) {
        <h2 id="confirm-title" class="text-[1.125rem] leading-[1.7] font-black">{{ q.title }}</h2>
        @if (q.message) {
          <p id="confirm-message" class="mt-2 text-[0.9375rem] leading-[1.9] text-mut">{{ q.message }}</p>
        }
        <div class="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" class="btn min-h-10 cursor-pointer px-5" autofocus (click)="answer(false)">انصراف</button>
          <button
            type="button"
            [class]="q.danger ? 'btn min-h-10 cursor-pointer border-transparent bg-rose px-5 text-white' : 'btn btn-main min-h-10 cursor-pointer px-5'"
            (click)="answer(true)"
          >
            {{ q.confirmLabel ?? 'تأیید' }}
          </button>
        </div>
      }
    </dialog>
  `,
})
export class ConfirmDialogComponent {
  protected readonly confirm = inject(ConfirmService);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    // A click on the <dialog> element itself (not its content) is a click on the backdrop. Keyboard users have Escape.
    effect((onCleanup) => {
      const el = this.dialog().nativeElement;
      const onClick = (event: MouseEvent): void => {
        if (event.target === el) {
          this.answer(false);
        }
      };
      el.addEventListener('click', onClick);
      onCleanup(() => el.removeEventListener('click', onClick));
    });

    effect(() => {
      const el = this.dialog().nativeElement;
      const open = this.confirm.pending() !== null;

      if (open && !el.open) {
        el.showModal();
      } else if (!open && el.open) {
        el.close();
      }
    });
  }

  protected answer(confirmed: boolean, event?: Event): void {
    // `cancel` fires on Escape: let our service close the dialog instead of the browser.
    event?.preventDefault();
    this.confirm.answer(confirmed);
  }

}
