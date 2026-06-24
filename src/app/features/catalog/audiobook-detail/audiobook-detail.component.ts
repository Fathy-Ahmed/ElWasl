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
import { AudiobookService } from '../../../core/services/audiobook.service';

@Component({
  selector: 'app-audiobook-detail',
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
  templateUrl: './audiobook-detail.component.html',
  styleUrls: ['./audiobook-detail.component.scss']
})
export class AudiobookDetailComponent implements OnInit {
  @Input() slug!: string; // Bound from router parameters. Contains audiobook ID.

  private readonly cartService = inject(CartService);
  private readonly audiobookService = inject(AudiobookService);
  private readonly router = inject(Router);

  readonly audiobook = signal<Product | null>(null);
  readonly isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadAudiobookDetails();
  }

  loadAudiobookDetails(): void {
    this.isLoading.set(true);
    this.audiobookService.getAudiobookById(this.slug).subscribe({
      next: (data) => {
        this.audiobook.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  addToCart(): void {
    const item = this.audiobook();
    if (item) {
      this.cartService.addToCart({
        productId: item.id,
        productType: item.productType,
        titleAr: item.titleAr,
        titleEn: item.titleEn,
        price: item.price,
        coverImage: item.coverImage
      });
    }
  }

  buyNow(): void {
    this.addToCart();
    this.router.navigate(['/cart']);
  }
}
