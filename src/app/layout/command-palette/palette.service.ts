import { Injectable, signal } from '@angular/core';

/** Open/closed state of the command palette (Ctrl/Cmd + K). */
@Injectable({ providedIn: 'root' })
export class PaletteService {
  private readonly open = signal(false);
  readonly isOpen = this.open.asReadonly();

  show(): void {
    this.open.set(true);
  }

  hide(): void {
    this.open.set(false);
  }
}
