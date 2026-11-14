import { RESPONSE_INIT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { provideTestConfig } from '../../../testing/test-providers';
import { NotFoundPageComponent } from './not-found-page.component';

describe('NotFoundPageComponent', () => {
  it('turns the server response into a 404 and renders the message', async () => {
    const response: ResponseInit = { status: 200 };
    await TestBed.configureTestingModule({
      imports: [NotFoundPageComponent],
      providers: [provideRouter([]), ...provideTestConfig(), { provide: RESPONSE_INIT, useValue: response }],
    }).compileComponents();

    const fixture = TestBed.createComponent(NotFoundPageComponent);
    fixture.detectChanges();

    expect(response.status).toBe(404);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('پیدا نشد');
  });
});
