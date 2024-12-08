import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styles: `
    * {
      @apply transition-colors duration-300;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private themeService = inject(ThemeService);

  protected isDark = signal(true);
  private isLoading = signal(false);

  constructor() {
    this.themeService.isDark$.subscribe((isDark) => this.isDark.set(isDark));
  }
}
