import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CartService } from '../../../core/cart/cart.service';
import { LocalizedTextPipe } from '../../pipes/localized-text.pipe';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';
import { PriceTagComponent } from '../price-tag/price-tag.component';
import { LocaleService } from '../../../core/i18n/locale.service';

import { CurrencyService } from '../../../core/services/currency.service';

export interface Product {
  id: string;
  productType: 'Book' | 'Audiobook' | 'Game';
  titleAr: string;
  titleEn: string;
  price: number;
  originalPrice?: number;
  priceUsd?: number;
  originalPriceUsd?: number;
  coverImage: string;
  authorAr?: string;
  authorEn?: string;
  slug: string;
  category?: string;
  genreAr?: string;
  genreEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  format?: string;
}


@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    PriceTagComponent,
    LocalizedTextPipe,
    ImageUrlPipe
  ],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly localeService = inject(LocaleService);
  readonly currencyService = inject(CurrencyService);

  get displayPrice(): number {
    if (this.currencyService.activeCurrency() === 'USD' && this.product.priceUsd && this.product.priceUsd > 0) {
      return this.product.priceUsd;
    }
    return this.product.price;
  }

  get displayOriginalPrice(): number | undefined {
    if (this.currencyService.activeCurrency() === 'USD' && this.product.originalPriceUsd && this.product.originalPriceUsd > 0) {
      return this.product.originalPriceUsd;
    }
    return this.product.originalPrice;
  }

  addToCart(event: Event): void {
    event.stopPropagation(); // Avoid navigating to details page
    this.cartService.addToCart({
      productId: this.product.id,
      productType: this.product.productType,
      titleAr: this.product.titleAr,
      titleEn: this.product.titleEn,
      price: this.product.price,
      coverImage: this.product.coverImage
    });
  }

  buyNow(event: Event): void {
    event.stopPropagation();
    const added = this.cartService.addToCart({
      productId: this.product.id,
      productType: this.product.productType,
      titleAr: this.product.titleAr,
      titleEn: this.product.titleEn,
      price: this.product.price,
      coverImage: this.product.coverImage
    });
    if (added) {
      this.router.navigate(['/cart']);
    }
  }

  getDetailsRoute(): string {
    if (this.product.productType === 'Book') {
      return `/books/${this.product.slug}`;
    } else if (this.product.productType === 'Audiobook') {
      return `/audiobooks/${this.product.slug}`;
    }
    return `/games/${this.product.slug}`;
  }

  getLocalizedFormat(format: string | undefined): string {
    if (!format) return '';
    const isAr = this.localeService.currentLocale() === 'ar';
    const fmtLower = format.toLowerCase();
    
    if (fmtLower.includes('hardcover')) {
      return isAr ? 'غلاف ورقي سميك (مجلد)' : 'Hardcover';
    }
    if (fmtLower.includes('paperback')) {
      return isAr ? 'غلاف ورقي عادي' : 'Paperback';
    }
    if (fmtLower.includes('ebook') || fmtLower.includes('e-book')) {
      return isAr ? 'كتاب إلكتروني' : 'E-Book';
    }
    if (fmtLower.includes('digital')) {
      return isAr ? 'نسخة رقمية' : 'Digital Edition';
    }
    return format;
  }
}
