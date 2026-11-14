import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ToolbarComponent } from '../../components/toolbar/toolbar.component';

@Component({
  selector: 'app-landing',
  imports: [ToolbarComponent],
  templateUrl: './landing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: ``,
})
export class LandingComponent {
  meta = inject(Meta);
  title = inject(Title);

  constructor() {
    this.title.setTitle('Ù…Ø¬ØªØ¨ÛŒ Ø¹Ø±ÙØ§Ù† Ø±Ø§Ø¯ | Ø·Ø±Ø§Ø­ÛŒ Ùˆ Ø¨Ø±Ù†Ø§Ù…Ù‡ Ù†ÙˆÛŒØ³ÛŒ ÙˆØ¨ Ø§Ù¾Ù„ÛŒÚ©ÛŒØ´Ù†');
    this.meta.addTags([
      {
        name: 'title',
        content: 'Ù…Ø¬ØªØ¨ÛŒ Ø¹Ø±ÙØ§Ù† Ø±Ø§Ø¯ | Ø·Ø±Ø§Ø­ÛŒ Ùˆ Ø¨Ø±Ù†Ø§Ù…Ù‡ Ù†ÙˆÛŒØ³ÛŒ ÙˆØ¨ Ø§Ù¾Ù„ÛŒÚ©ÛŒØ´Ù†',
      },
    ]);
  }
}
