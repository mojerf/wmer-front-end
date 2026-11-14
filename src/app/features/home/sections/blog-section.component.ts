import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { SectionHeadComponent } from '../../../shared/ui/section-head/section-head.component';
import { Post } from '../data-access/home.models';

@Component({
  selector: 'app-blog-section',
  imports: [SectionHeadComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'wrap block pt-[5.625rem]', id: 'blog' },
  template: `
    <app-section-head title="نوشته‌ها" label="02 / BLOG" headingId="blog-title" />

    <div appReveal aria-labelledby="blog-title">
      @for (post of posts(); track post.id) {
        <article
          class="flex items-center justify-between gap-3.5 border-b border-line px-1 py-5 transition-all duration-300 hover:bg-linear-to-l hover:from-line hover:to-transparent hover:px-4"
        >
          <h3 class="text-[1.25rem] font-medium">{{ post.title }}</h3>
          <span class="text-[0.8125rem] whitespace-nowrap text-mut">{{ post.publishedLabel }}</span>
        </article>
      }
    </div>
  `,
})
export class BlogSectionComponent {
  readonly posts = input.required<readonly Post[]>();
}
