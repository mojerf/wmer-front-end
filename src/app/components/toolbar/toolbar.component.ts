import { Component, inject, signal } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-toolbar',
  imports: [],
  templateUrl: './toolbar.component.html',
  styles: ``,
})
export class ToolbarComponent {
  private themeService = inject(ThemeService);

  protected isDark = signal(true);

  constructor() {
    this.themeService.isDark$.subscribe((isDark) => this.isDark.set(isDark));
  }

  protected changeTheme() {
    this.themeService.setThemeDark(!this.isDark());
  }
}
