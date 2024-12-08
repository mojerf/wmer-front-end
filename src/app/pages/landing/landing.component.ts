import { Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ToolbarComponent } from '../../components/toolbar/toolbar.component';

@Component({
  selector: 'app-landing',
  imports: [ToolbarComponent],
  templateUrl: './landing.component.html',
  styles: ``,
})
export class LandingComponent {
  meta = inject(Meta);
  title = inject(Title);

  constructor() {
    this.title.setTitle('مجتبی عرفان راد | طراحی و برنامه نویسی وب اپلیکیشن');
    this.meta.addTags([
      {
        name: 'title',
        content: 'مجتبی عرفان راد | طراحی و برنامه نویسی وب اپلیکیشن',
      },
    ]);
  }
}
