import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { OrderService } from '../../../core/services/order.service';
import { OrderDto } from '../../../core/models/api.models';
import { CurrencyEgpPipe } from '../../../shared/pipes/currency-egp.pipe';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, MatButtonModule, MatIconModule, CurrencyEgpPipe],
  template: `
    <div class="confirm-page container" id="confirmation-view">
      <div class="confirm-card">
        <div class="success-icon-wrapper">
          <mat-icon class="success-icon">check_circle</mat-icon>
        </div>
        
        <h1 class="confirm-title">شكراً لك! تم استلام طلبك بنجاح</h1>
        <h2 class="confirm-subtitle">Thank you! Your order has been received.</h2>
        
        <div class="order-info">
          <p class="order-id-label">رقم الطلب / Order ID</p>
          <strong class="order-id" id="confirmation-order-id">{{ order()?.orderNumber || orderId }}</strong>
        </div>

        @if (order(); as ord) {
          <div class="order-details-grid">
            <div class="detail-item">
              <span class="detail-label">طريقة الدفع / Payment</span>
              <span class="detail-val payment-tag" [class.cod-tag]="ord.paymentMethod?.includes('Cash')">
                <mat-icon class="val-icon">payments</mat-icon>
                {{ ord.paymentMethod || 'الدفع عند الاستلام / Cash on Delivery' }}
              </span>
            </div>

            @if (ord.totalAmount) {
              <div class="detail-item">
                <span class="detail-label">الإجمالي / Total Amount</span>
                <span class="detail-val total-val">{{ ord.totalAmount | currencyEgp }}</span>
              </div>
            }

            @if (ord.shippingAddress) {
              <div class="detail-item full-width">
                <span class="detail-label">عنوان التوصيل / Shipping Address</span>
                <span class="detail-val address-val">
                  <mat-icon class="val-icon">location_on</mat-icon>
                  {{ ord.shippingAddress }}
                </span>
              </div>
            }
          </div>
        }
        
        <p class="confirm-desc">
          سنقوم بتجهيز طلبيتك وشحنها إليك في أقرب وقت. تم إرسال تفاصيل الطلب إلى بريدك الإلكتروني، ويمكنك متابعة حالة الطلب عبر حسابك.
        </p>

        <div class="actions-row">
          <a routerLink="/" mat-stroked-button color="primary" class="action-btn" id="confirm-back-home">
            <mat-icon>home</mat-icon>
            الرئيسية / Home
          </a>
          <a routerLink="/account/profile" mat-flat-button color="primary" class="action-btn" id="confirm-view-orders">
            <mat-icon>receipt_long</mat-icon>
            متابعة طلباتي / My Orders
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import '../../../../styles/variables';
    @import '../../../../styles/mixins';

    .confirm-page {
      padding: 4rem 1.5rem;
      @include flex-center;
      flex-grow: 1;
    }

    .confirm-card {
      background-color: white;
      border: 1px solid $border-color;
      border-radius: $border-radius-lg;
      padding: 3rem 2rem;
      max-width: 620px;
      width: 100%;
      text-align: center;
      box-shadow: $shadow-lg;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .success-icon-wrapper {
      background-color: rgba($success, 0.1);
      border-radius: 50%;
      width: 80px;
      height: 80px;
      @include flex-center;
      
      .success-icon {
        font-size: 3.5rem;
        width: 3.5rem;
        height: 3.5rem;
        color: $success;
      }
    }

    .confirm-title {
      font-size: 1.6rem;
      font-weight: 800;
      color: $primary-dark;
      font-family: $font-arabic;
    }

    .confirm-subtitle {
      font-size: 1.15rem;
      font-weight: 700;
      color: $text-dark;
      font-family: $font-latin;
      margin-top: -0.75rem;
    }

    .order-info {
      background-color: $bg-light;
      border: 1px solid $border-color;
      border-radius: $border-radius;
      padding: 0.75rem 2rem;
      width: 100%;
      max-width: 460px;
      
      .order-id-label {
        font-size: 0.85rem;
        color: $text-muted;
        font-weight: 500;
        margin-bottom: 0.25rem;
      }
      
      .order-id {
        font-size: 1.3rem;
        color: $primary-color;
        font-family: monospace;
        letter-spacing: 1px;
      }
    }

    .order-details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      width: 100%;
      max-width: 460px;
      background: #fdfdfd;
      border: 1px dashed $border-color;
      border-radius: $border-radius;
      padding: 1.25rem;
      text-align: start;

      .full-width {
        grid-column: 1 / -1;
      }

      .detail-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .detail-label {
          font-size: 0.75rem;
          color: $text-muted;
          font-weight: 600;
          text-transform: uppercase;
        }

        .detail-val {
          font-size: 0.95rem;
          font-weight: 600;
          color: $text-dark;
          display: flex;
          align-items: center;
          gap: 0.35rem;

          .val-icon {
            font-size: 1.1rem;
            width: 1.1rem;
            height: 1.1rem;
            color: $text-muted;
          }
        }

        .payment-tag {
          color: #0d6efd;
          &.cod-tag {
            color: #198754;
            font-weight: 700;
            .val-icon {
              color: #198754;
            }
          }
        }

        .total-val {
          color: $primary-color;
          font-weight: 800;
          font-size: 1.05rem;
        }

        .address-val {
          font-size: 0.85rem;
          color: #495057;
          font-weight: 500;
        }
      }
    }

    .confirm-desc {
      font-size: 0.95rem;
      color: $text-muted;
      line-height: 1.6;
      max-width: 480px;
    }

    .actions-row {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      justify-content: center;
      width: 100%;

      .action-btn {
        border-radius: 20px;
        font-weight: 600;
        padding: 0 20px;
        height: 42px;
        line-height: 40px;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;

        mat-icon {
          font-size: 1.2rem;
          width: 1.2rem;
          height: 1.2rem;
        }
      }
    }

    @media (max-width: 600px) {
      .order-details-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class OrderConfirmationComponent implements OnInit {
  @Input() orderId!: string;
  private readonly orderService = inject(OrderService);

  readonly order = signal<OrderDto | null>(null);

  ngOnInit(): void {
    if (this.orderId) {
      this.orderService.getOrderById(this.orderId).subscribe({
        next: (ord) => {
          this.order.set(ord);
        },
        error: () => {}
      });
    }
  }
}
