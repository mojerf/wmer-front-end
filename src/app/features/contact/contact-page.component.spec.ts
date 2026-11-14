import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { provideTestConfig } from '../../../testing/test-providers';
import { ApiError } from '../../core/http/api.interceptors';
import { ContactPageComponent } from './contact-page.component';
import { ContactApi } from './data-access/contact.api';

describe('ContactPageComponent', () => {
  const send = vi.fn();

  const create = async () => {
    await TestBed.configureTestingModule({
      imports: [ContactPageComponent],
      providers: [provideRouter([]), ...provideTestConfig(), { provide: ContactApi, useValue: { send } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(ContactPageComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const type = (name: string, value: string) => {
      const input = el.querySelector<HTMLInputElement>(`[formcontrolname=${name}]`)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    };
    const submit = async () => {
      el.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
      fixture.detectChanges();
    };
    return { el, type, submit };
  };

  beforeEach(() => send.mockReset());

  it('validates before sending', async () => {
    const { el, submit } = await create();

    await submit();

    expect(send).not.toHaveBeenCalled();
    expect(el.textContent).toContain('ایمیل را وارد کنید.');
    expect(el.textContent).toContain('موضوع را بنویسید.');
    expect(el.textContent).toContain('متن پیام را بنویسید.');
  });

  it('sends the message and confirms', async () => {
    send.mockReturnValue(of(undefined));
    const { el, type, submit } = await create();

    type('email', 'visitor@example.test');
    type('title', 'همکاری');
    type('text', 'سلام، یک پروژه دارم.');
    await submit();

    expect(send).toHaveBeenCalledWith({
      email: 'visitor@example.test',
      phoneNumber: '',
      title: 'همکاری',
      text: 'سلام، یک پروژه دارم.',
    });
    expect(el.querySelector('[role=status]')?.textContent).toContain('پیامتان ارسال شد');
    expect(el.querySelector('form')).toBeNull();
  });

  it('keeps the form and explains rate limiting', async () => {
    send.mockReturnValue(throwError(() => new ApiError(429, 'Too Many Attempts.')));
    const { el, type, submit } = await create();

    type('email', 'visitor@example.test');
    type('title', 'همکاری');
    type('text', 'سلام');
    await submit();

    expect(el.querySelector('form')).toBeTruthy();
    expect(el.textContent).toContain('تعداد درخواست‌ها زیاد است');
  });
});
