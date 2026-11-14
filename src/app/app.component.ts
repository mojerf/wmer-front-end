import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialogComponent } from './shared/ui/confirm/confirm-dialog.component';
import { CommandPaletteComponent } from './layout/command-palette/command-palette.component';
import { SiteFooterComponent } from './layout/site-footer/site-footer.component';
import { SiteHeaderComponent } from './layout/site-header/site-header.component';
import { VerifyEmailBannerComponent } from './layout/verify-email-banner/verify-email-banner.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    SiteHeaderComponent,
    SiteFooterComponent,
    CommandPaletteComponent,
    VerifyEmailBannerComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
