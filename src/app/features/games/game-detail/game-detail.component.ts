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
import { GameService } from '../../../core/services/game.service';

@Component({
  selector: 'app-game-detail',
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
  templateUrl: './game-detail.component.html',
  styleUrls: ['./game-detail.component.scss']
})
export class GameDetailComponent implements OnInit {
  @Input() slug!: string; // Bound from router parameters. Contains game ID.

  private readonly cartService = inject(CartService);
  private readonly gameService = inject(GameService);
  private readonly router = inject(Router);

  readonly game = signal<Product | null>(null);
  readonly isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadGameDetails();
  }

  loadGameDetails(): void {
    this.isLoading.set(true);
    this.gameService.getGameById(this.slug).subscribe({
      next: (data) => {
        this.game.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  addToCart(): boolean {
    const item = this.game();
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
}
