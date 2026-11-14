import { TestBed } from '@angular/core/testing';
import { beforeAll, describe, expect, it } from 'vitest';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { ConfirmService } from './confirm.service';

describe('ConfirmService and dialog', () => {
  // jsdom does not implement the modal <dialog> API.
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    };
  });

  const setup = () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.detectChanges();
    const service = TestBed.inject(ConfirmService);
    const el = fixture.nativeElement as HTMLElement;
    return { fixture, service, el };
  };

  it('shows the question and resolves true when confirmed', async () => {
    const { fixture, service, el } = setup();

    const answer = service.ask({ title: 'حذف شود؟', message: 'قابل بازگشت نیست', confirmLabel: 'حذف', danger: true });
    fixture.detectChanges();

    expect(el.textContent).toContain('حذف شود؟');
    expect(el.textContent).toContain('قابل بازگشت نیست');

    const buttons = el.querySelectorAll<HTMLButtonElement>('button');
    expect(buttons[1]!.textContent).toContain('حذف');
    buttons[1]!.click();

    expect(await answer).toBe(true);
    fixture.detectChanges();
    expect(service.pending()).toBeNull();
  });

  it('resolves false on cancel, and when a newer question replaces it', async () => {
    const { fixture, service, el } = setup();

    const first = service.ask({ title: 'اولی؟' });
    const second = service.ask({ title: 'دومی؟' });
    expect(await first).toBe(false);

    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('button')!.click();
    expect(await second).toBe(false);
  });

  it('treats Escape (the dialog cancel event) as "no" without letting the browser close it first', async () => {
    const { fixture, service, el } = setup();
    const answer = service.ask({ title: 'مطمئنید؟' });
    fixture.detectChanges();

    const event = new Event('cancel', { cancelable: true });
    el.querySelector('dialog')!.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(await answer).toBe(false);
  });
});
