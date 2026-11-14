import { DOCUMENT, inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { APP_CONFIG } from '../config/app-config';
import { SITE } from '../config/site.config';

export interface SeoConfig {
  title: string;
  description: string;
  /** Path starting with "/", used for the canonical URL. */
  path?: string;
  /** Keeps the page out of search results (e.g. the 404 page). */
  noindex?: boolean;
  /** Structured data objects, serialized as JSON-LD. */
  jsonLd?: readonly object[];
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);
  private readonly config = inject(APP_CONFIG);

  /** Absolute URL of the site, without a trailing slash. */
  get siteUrl(): string {
    return this.config.siteUrl.replace(/\/$/, '');
  }

  set(config: SeoConfig): void {
    const url = this.siteUrl + (config.path ?? '/');

    this.titleService.setTitle(config.title);
    this.meta.updateTag({ name: 'description', content: config.description });
    this.meta.updateTag({
      name: 'robots',
      content: config.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    });

    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE.name });
    this.meta.updateTag({ property: 'og:locale', content: SITE.locale });
    this.meta.updateTag({ property: 'og:title', content: config.title });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:url', content: url });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: config.title });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });

    this.setCanonical(config.noindex ? null : url);
    this.setJsonLd(config.jsonLd ?? []);
  }

  /** Pass null to remove the canonical link (pages that must not be indexed have none). */
  private setCanonical(url: string | null): void {
    let link = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (url === null) {
      link?.remove();
      return;
    }
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private setJsonLd(items: readonly object[]): void {
    this.doc.head.querySelectorAll('script[data-seo="jsonld"]').forEach((node) => node.remove());

    for (const item of items) {
      const script = this.doc.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-seo', 'jsonld');
      // "<" is escaped so the JSON can never close the script tag early.
      script.textContent = JSON.stringify(item).replace(/</g, '\\u003c');
      this.doc.head.appendChild(script);
    }
  }
}
