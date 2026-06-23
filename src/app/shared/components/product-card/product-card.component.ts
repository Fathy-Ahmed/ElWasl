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

export interface Product {
  id: string;
  productType: 'Book' | 'Audiobook' | 'Game';
  titleAr: string;
  titleEn: string;
  price: number;
  originalPrice?: number;
  coverImage: string;
  authorAr?: string;
  authorEn?: string;
  slug: string;
  category?: string;
  genreAr?: string;
  genreEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
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
    this.cartService.addToCart({
      productId: this.product.id,
      productType: this.product.productType,
      titleAr: this.product.titleAr,
      titleEn: this.product.titleEn,
      price: this.product.price,
      coverImage: this.product.coverImage
    });
    this.router.navigate(['/cart']);
  }

  getDetailsRoute(): string {
    if (this.product.productType === 'Book') {
      return `/books/${this.product.slug}`;
    } else if (this.product.productType === 'Audiobook') {
      return `/audiobooks/${this.product.slug}`;
    }
    return `/games/${this.product.slug}`;
  }
}
