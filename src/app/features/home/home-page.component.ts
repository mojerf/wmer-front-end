import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { SITE } from '../../core/config/site.config';
import { SeoService } from '../../core/seo/seo.service';
import { HomeContent } from './data-access/home.models';
import { BlogSectionComponent } from './sections/blog-section.component';
import { ContactSectionComponent } from './sections/contact-section.component';
import { HeroSectionComponent } from './sections/hero-section.component';
import { ShopSectionComponent } from './sections/shop-section.component';
import { TechMarqueeComponent } from './sections/tech-marquee.component';
import { WorksSectionComponent } from './sections/works-section.component';

@Component({
  selector: 'app-home-page',
  imports: [
    HeroSectionComponent,
    TechMarqueeComponent,
    WorksSectionComponent,
    BlogSectionComponent,
    ShopSectionComponent,
    ContactSectionComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-hero-section />
    <app-tech-marquee />
    <app-works-section [works]="content().works" />
    <app-blog-section [posts]="content().posts" />
    <app-shop-section [products]="content().products" />
    <app-contact-section />
  `,
})
export class HomePageComponent {
  /** Provided by the route resolver through component input binding. */
  readonly content = input.required<HomeContent>();

  constructor() {
    const seo = inject(SeoService);
    const url = seo.siteUrl;

    seo.set({
      title: SITE.title,
      description: SITE.description,
      path: '/',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: SITE.name,
          jobTitle: SITE.jobTitle,
          url,
          sameAs: [SITE.github.profile],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE.name,
          url,
          inLanguage: 'fa-IR',
        },
      ],
    });
  }
}
