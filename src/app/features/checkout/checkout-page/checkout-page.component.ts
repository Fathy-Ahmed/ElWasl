import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CartService } from '../../../core/cart/cart.service';
import { CurrencyEgpPipe } from '../../../shared/pipes/currency-egp.pipe';
import { LocalizedTextPipe } from '../../../shared/pipes/localized-text.pipe';
import { ImageUrlPipe } from '../../../shared/pipes/image-url.pipe';
import { AuthService } from '../../../core/auth/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { ProductType, PaymentProvider, OrderItemDto } from '../../../core/models/api.models';

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
  private readonly snackBar = inject(MatSnackBar);

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

    if (this.cartService.items().length === 0) {
      this.snackBar.open('عربة التسوق فارغة / Your cart is empty', 'إغلاق / Close', { duration: 3000 });
      return;
    }

    this.isSubmitting.set(true);

    const formVal = this.checkoutForm.value;
    const payMethod = formVal.paymentMethod;

    const mapProductType = (type: 'Book' | 'Audiobook' | 'Game'): ProductType => {
      if (type === 'Book') return ProductType.Book;
      if (type === 'Audiobook') return ProductType.Audiobook;
      return ProductType.Game;
    };

    const cartItems = this.cartService.items();
    const orderItems = cartItems.map(item => ({
      productType: mapProductType(item.productType),
      productId: item.productId,
      quantity: item.quantity
    }));

    const orderItemsSnapshot: OrderItemDto[] = cartItems.map(item => ({
      id: `item-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      productType: mapProductType(item.productType),
      productId: item.productId,
      productTitleSnapshot: item.titleAr || item.titleEn || 'منتج',
      unitPrice: item.price,
      quantity: item.quantity
    }));

    const totalAmount = this.cartService.totalPrice();

    this.orderService.createOrder({
      items: orderItems,
      shippingAddressId: null,
      customerDetails: {
        fullName: formVal.fullName,
        email: formVal.email,
        phone: formVal.phone,
        address: formVal.address,
        city: formVal.city,
        paymentMethod: payMethod === 'card' ? 'Credit Card' : 'Cash on Delivery'
      },
      totalAmount,
      orderItemsSnapshot
    }).subscribe({
      next: (order) => {
        this.cartService.clearCart();
        const confirmationId = order.orderNumber || order.id;

        if (payMethod === 'card') {
          // Initiate Visa/Stripe payment
          this.orderService.initiatePayment({
            orderId: order.id,
            provider: PaymentProvider.Stripe,
            successUrl: `${window.location.origin}/checkout/confirmation/${confirmationId}`,
            cancelUrl: `${window.location.origin}/checkout`
          }).subscribe({
            next: (payRes) => {
              this.isSubmitting.set(false);
              if (payRes && payRes.paymentUrl) {
                window.location.href = payRes.paymentUrl;
              } else {
                this.snackBar.open('تم تأكيد الطلب بنجاح / Order confirmed', 'إغلاق / Close', { duration: 3000 });
                this.router.navigate(['/checkout/confirmation', confirmationId]);
              }
            },
            error: () => {
              this.isSubmitting.set(false);
              this.snackBar.open('تم تسجيل طلبك وسيتواصل معك فريق العمل لتأكيد الدفع / Order recorded', 'إغلاق / Close', { duration: 4000 });
              this.router.navigate(['/checkout/confirmation', confirmationId]);
            }
          });
        } else {
          // Cash on Delivery
          this.isSubmitting.set(false);
          this.snackBar.open('تم تأكيد طلبك بنجاح والدفع عند الاستلام! / Order placed with Cash on Delivery!', 'إغلاق / Close', { duration: 4000 });
          this.router.navigate(['/checkout/confirmation', confirmationId]);
        }
      },
      error: () => {
        this.isSubmitting.set(false);
        this.snackBar.open('حدث خطأ أثناء حفظ الطلب، يرجى المحاولة مرة أخرى', 'إغلاق / Close', { duration: 4000 });
      }
    });
  }
}
