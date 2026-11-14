import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { provideTestConfig } from '../../../../testing/test-providers';
import { AuthService } from '../../../core/auth/auth.service';
import { ApiError } from '../../../core/http/api.interceptors';
import { BlogApi } from '../data-access/blog.api';
import { CommentFormComponent } from './comment-form.component';

describe('CommentFormComponent', () => {
  const addComment = vi.fn();
  const loggedIn = signal(false);

  const create = async () => {
    await TestBed.configureTestingModule({
      imports: [CommentFormComponent],
      providers: [
        provideRouter([]),
        ...provideTestConfig(),
        { provide: BlogApi, useValue: { addComment } },
        { provide: AuthService, useValue: { isLoggedIn: loggedIn } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CommentFormComponent);
    fixture.componentRef.setInput('slug', 'my-post');
    fixture.detectChanges();
    return fixture;
  };

  beforeEach(() => {
    addComment.mockReset();
    loggedIn.set(false);
  });

  it('invites guests to sign in, remembering where they were', async () => {
    const el = (await create()).nativeElement as HTMLElement;

    expect(el.querySelector('textarea')).toBeNull();
    expect(el.querySelector('a[href^="/login"]')).toBeTruthy();
    expect(el.querySelector('a[href^="/register"]')).toBeTruthy();
  });

  it('posts a trimmed comment, resets and notifies the page', async () => {
    loggedIn.set(true);
    addComment.mockReturnValue(of(undefined));
    const fixture = await create();
    const el = fixture.nativeElement as HTMLElement;
    const posted = vi.fn();
    fixture.componentInstance.posted.subscribe(posted);

    const textarea = el.querySelector('textarea')!;
    textarea.value = '  نظر من  ';
    textarea.dispatchEvent(new Event('input'));
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(addComment).toHaveBeenCalledWith('my-post', 'نظر من', null);
    expect(posted).toHaveBeenCalledTimes(1);
    expect(textarea.value).toBe('');
  });

  it('sends the parent id for replies', async () => {
    loggedIn.set(true);
    addComment.mockReturnValue(of(undefined));
    const fixture = await create();
    fixture.componentRef.setInput('replyTo', {
      id: 7,
      authorName: 'علی',
      body: 'x',
      createdAt: '2026-01-01T00:00:00Z',
      canDelete: false,
      replies: [],
    });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain('پاسخ به علی');
    const textarea = el.querySelector('textarea')!;
    textarea.value = 'جواب';
    textarea.dispatchEvent(new Event('input'));
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(addComment).toHaveBeenCalledWith('my-post', 'جواب', 7);
  });

  it('shows an API failure instead of losing the comment', async () => {
    loggedIn.set(true);
    addComment.mockReturnValue(throwError(() => new ApiError(429, 'Too Many Attempts.')));
    const fixture = await create();
    const el = fixture.nativeElement as HTMLElement;

    const textarea = el.querySelector('textarea')!;
    textarea.value = 'نظر من';
    textarea.dispatchEvent(new Event('input'));
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(el.textContent).toContain('تعداد درخواست‌ها زیاد است');
    expect(textarea.value).toBe('نظر من');
  });
});
