import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  /** Extra explanation under the title. */
  message?: string;
  /** Label of the confirming button. Defaults to "تأیید". */
  confirmLabel?: string;
  /** Style the confirming button as destructive (red). */
  danger?: boolean;
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

/**
 * The site's own confirmation dialog, used instead of `window.confirm`:
 * `if (await confirm.ask({ title: 'حذف شود؟', danger: true })) { … }`.
 * The dialog itself is rendered once by `ConfirmDialogComponent` (placed in the app shell).
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly current = signal<PendingConfirm | null>(null);
  readonly pending = this.current.asReadonly();

  /** Resolves `true` when the user confirms, `false` on cancel, Escape or a click outside. */
  ask(options: ConfirmOptions): Promise<boolean> {
    // Only one question at a time: a new one answers the old one with "no".
    this.current()?.resolve(false);

    return new Promise<boolean>((resolve) => {
      this.current.set({ ...options, resolve });
    });
  }

  /** Called by the dialog component. */
  answer(confirmed: boolean): void {
    const pending = this.current();
    this.current.set(null);
    pending?.resolve(confirmed);
  }
}
