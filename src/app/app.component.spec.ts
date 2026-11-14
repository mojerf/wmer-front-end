import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { provideTestConfig } from '../testing/test-providers';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('renders the shell: skip link, header, main and footer', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), ...provideTestConfig()],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('a[href="#main"]')).toBeTruthy();
    expect(el.querySelector('app-site-header')).toBeTruthy();
    expect(el.querySelector('main#main')).toBeTruthy();
    expect(el.querySelector('app-site-footer')).toBeTruthy();
  });
});
