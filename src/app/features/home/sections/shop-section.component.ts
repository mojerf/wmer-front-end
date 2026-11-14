import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { SpotlightDirective } from '../../../shared/directives/spotlight.directive';
import { FaNumberPipe } from '../../../shared/pipes/fa-number.pipe';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SectionHeadComponent } from '../../../shared/ui/section-head/section-head.component';
import { Product } from '../data-access/home.models';
import { decorAt } from '../home.content';

@Component({
  selector: 'app-shop-section',
  imports: [SectionHeadComponent, RevealDirective, SpotlightDirective, FaNumberPipe, RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'wrap block pt-[5.625rem]', id: 'shop' },
  template: `
    <app-section-head title="فروشگاه" label="03 / SHOP" headingId="shop-title" />

    <div class="grid gap-[0.875rem] sm:grid-cols-2" aria-labelledby="shop-title">
      @for (product of products(); track product.id; let i = $index) {
        <article appSpotlight [appReveal]="i * 90" class="card">
          <a [routerLink]="['/shop', product.slug]" class="absolute inset-0 z-10" [attr.aria-label]="product.title"></a>
          <div
            class="-mx-1.5 -mt-1.5 mb-4 grid h-[6.875rem] place-items-center overflow-hidden rounded-2xl text-[2.75rem]"
            [class]="product.imageUrl ? 'bg-bg-2' : decor(i).gradient"
          >
            @if (product.imageUrl) {
              <img [src]="product.imageUrl" [alt]="product.title" loading="lazy" class="size-full object-cover" />
            } @else {
              <span aria-hidden="true">{{ decor(i).glyph }}</span>
            }
          </div>
          <h3 class="text-[1.1875rem] font-bold">{{ product.title }}</h3>
          <div class="mt-4 flex items-center justify-between">
            <div>
              <b class="text-[1.25rem]">{{ product.price | faNumber }}</b>
              <span class="ms-1 text-[0.75rem] text-mut">تومان</span>
              @if (product.oldPrice) {
                <s class="ms-2 text-[0.8125rem] text-mut">{{ product.oldPrice | faNumber }}</s>
                <span class="ms-2 rounded-full bg-rose/15 px-2 py-0.5 text-[0.6875rem] text-rose">تخفیف</span>
              }
            </div>
            <span class="text-[0.8125rem] text-aqua">مشاهده</span>
          </div>
        </article>
      }
    </div>

    <a routerLink="/shop" class="btn mt-6">همه‌ی محصولات <app-icon name="arrow" /></a>
  `,
})
export class ShopSectionComponent {
  readonly products = input.required<readonly Product[]>();
  protected readonly decor = decorAt;
}
