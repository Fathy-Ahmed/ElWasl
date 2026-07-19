import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CartService } from '../../../core/cart/cart.service';
import { CurrencyEgpPipe } from '../../../shared/pipes/currency-egp.pipe';
import { LocalizedTextPipe } from '../../../shared/pipes/localized-text.pipe';
import { ImageUrlPipe } from '../../../shared/pipes/image-url.pipe';
import { Product } from '../../../shared/components/product-card/product-card.component';
import { BookService } from '../../../core/services/book.service';
import { LocaleService } from '../../../core/i18n/locale.service';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    CurrencyEgpPipe,
    LocalizedTextPipe,
    ImageUrlPipe
  ],
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.scss']
})
export class BookDetailComponent implements OnInit {
  @Input() slug!: string; // Bound from route params. Contains the book ID.

  private readonly cartService = inject(CartService);
  private readonly bookService = inject(BookService);
  private readonly router = inject(Router);
  private readonly localeService = inject(LocaleService);

  readonly book = signal<Product | null>(null);
  readonly isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadBookDetails();
  }

  loadBookDetails(): void {
    this.isLoading.set(true);
    this.bookService.getBookById(this.slug).subscribe({
      next: (data) => {
        this.book.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  addToCart(): boolean {
    const item = this.book();
    if (item) {
      return this.cartService.addToCart({
        productId: item.id,
        productType: item.productType,
        titleAr: item.titleAr,
        titleEn: item.titleEn,
        price: item.price,
        coverImage: item.coverImage
      });
    }
    return false;
  }

  buyNow(): void {
    if (this.addToCart()) {
      this.router.navigate(['/cart']);
    }
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
    if (fmtLower.includes('ebook') || fmtLower.includes('e-book') || fmtLower.includes('digital') || fmtLower.includes('electronic')) {
      return isAr ? 'غلاف ورقي عادي' : 'Paperback';
    }
    return format;
  }
}
