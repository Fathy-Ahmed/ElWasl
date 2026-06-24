import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CartService } from '../../../core/cart/cart.service';
import { CurrencyEgpPipe } from '../../../shared/pipes/currency-egp.pipe';
import { LocalizedTextPipe } from '../../../shared/pipes/localized-text.pipe';
import { ImageUrlPipe } from '../../../shared/pipes/image-url.pipe';
import { AuthService } from '../../../core/auth/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { ProductType, PaymentProvider } from '../../../core/models/api.models';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatIconModule,
    CurrencyEgpPipe,
    LocalizedTextPipe,
    ImageUrlPipe
  ],
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.scss']
})
export class CheckoutPageComponent implements OnInit {
  readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly orderService = inject(OrderService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  checkoutForm!: FormGroup;
  readonly isSubmitting = signal<boolean>(false);

  ngOnInit(): void {
    const user = this.authService.currentUser();
    
    this.checkoutForm = this.fb.group({
      fullName: [user?.name || '', Validators.required],
      email: [user?.email || '', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
      address: ['', Validators.required],
      city: ['Cairo', Validators.required],
      paymentMethod: ['cod', Validators.required]
    });
  }

  placeOrder(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const mapProductType = (type: 'Book' | 'Audiobook' | 'Game'): ProductType => {
      if (type === 'Book') return ProductType.Book;
      if (type === 'Audiobook') return ProductType.Audiobook;
      return ProductType.Game;
    };

    const orderItems = this.cartService.items().map(item => ({
      productType: mapProductType(item.productType),
      productId: item.productId,
      quantity: item.quantity
    }));

    this.orderService.createOrder({
      items: orderItems,
      shippingAddressId: null // We capture shipping address as form text in the UI
    }).subscribe({
      next: (order) => {
        this.cartService.clearCart();
        const payMethod = this.checkoutForm.value.paymentMethod;

        if (payMethod === 'card') {
          // Initiate Visa/Stripe payment
          this.orderService.initiatePayment({
            orderId: order.id,
            provider: PaymentProvider.Stripe,
            successUrl: `${window.location.origin}/checkout/confirmation/${order.id}`,
            cancelUrl: `${window.location.origin}/checkout`
          }).subscribe({
            next: (payRes) => {
              this.isSubmitting.set(false);
              if (payRes && payRes.paymentUrl) {
                window.location.href = payRes.paymentUrl;
              } else {
                this.router.navigate(['/checkout/confirmation', order.id]);
              }
            },
            error: () => {
              this.isSubmitting.set(false);
              this.router.navigate(['/checkout/confirmation', order.id]);
            }
          });
        } else {
          this.isSubmitting.set(false);
          this.router.navigate(['/checkout/confirmation', order.id]);
        }
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }
}
