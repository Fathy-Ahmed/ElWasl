import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, MatButtonModule, MatIconModule],
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
          <strong class="order-id" id="confirmation-order-id">{{ orderId }}</strong>
        </div>
        
        <p class="confirm-desc">
          سنقوم بتجهيز طلبيتك وشحنها إليك في أقرب وقت. تم إرسال تفاصيل الطلب إلى بريدك الإلكتروني.
        </p>

        <a routerLink="/" mat-flat-button color="primary" class="home-btn" id="confirm-back-home">
          العودة للرئيسية / Back to Home
        </a>
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
      max-width: 600px;
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
      font-size: 1.25rem;
      font-weight: 700;
      color: $text-dark;
      font-family: $font-latin;
      margin-top: -0.75rem;
    }

    .order-info {
      background-color: $bg-light;
      border: 1px solid $border-color;
      border-radius: $border-radius;
      padding: 1rem 2rem;
      
      .order-id-label {
        font-size: 0.85rem;
        color: $text-muted;
        font-weight: 500;
      }
      
      .order-id {
        font-size: 1.3rem;
        color: $primary-color;
        font-family: monospace;
      }
    }

    .confirm-desc {
      font-size: 0.95rem;
      color: $text-muted;
      line-height: 1.6;
      max-width: 450px;
    }

    .home-btn {
      border-radius: 20px;
      font-weight: 600;
      padding: 0 24px;
      height: 42px;
      line-height: 40px;
    }
  `]
})
export class OrderConfirmationComponent {
  @Input() orderId!: string;
}
