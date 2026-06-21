import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CartItem, CartService } from '../../../core/cart/cart.service';
import { CurrencyEgpPipe } from '../../../shared/pipes/currency-egp.pipe';
import { LocalizedTextPipe } from '../../../shared/pipes/localized-text.pipe';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    CurrencyEgpPipe,
    LocalizedTextPipe
  ],
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.scss']
})
export class CartPageComponent {
  readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  increaseQty(item: CartItem): void {
    this.cartService.updateQuantity(item.productId, item.productType, item.quantity + 1);
  }

  decreaseQty(item: CartItem): void {
    this.cartService.updateQuantity(item.productId, item.productType, item.quantity - 1);
  }

  removeItem(item: CartItem): void {
    this.cartService.removeItem(item.productId, item.productType);
  }

  checkout(): void {
    this.router.navigate(['/checkout']);
  }
}
