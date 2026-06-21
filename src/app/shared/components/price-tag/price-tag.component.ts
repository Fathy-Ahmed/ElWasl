import { CommonModule } from '@angular/common';
import { Component, Input, computed } from '@angular/core';
import { CurrencyEgpPipe } from '../../pipes/currency-egp.pipe';

@Component({
  selector: 'app-price-tag',
  standalone: true,
  imports: [CommonModule, CurrencyEgpPipe],
  template: `
    <div class="price-container">
      @if (hasDiscount()) {
        <span class="original-price">{{ originalPrice | currencyEgp }}</span>
        <span class="discounted-price">{{ price | currencyEgp }}</span>
        <span class="discount-badge">-{{ discountPercent() }}%</span>
      } @else {
        <span class="regular-price">{{ price | currencyEgp }}</span>
      }
    </div>
  `,
  styles: [`
    @import '../../../../styles/variables';
    
    .price-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    
    .regular-price {
      font-size: 1.1rem;
      font-weight: 700;
      color: $primary-color;
    }
    
    .discounted-price {
      font-size: 1.1rem;
      font-weight: 700;
      color: $danger;
    }
    
    .original-price {
      font-size: 0.9rem;
      color: $text-muted;
      text-decoration: line-through;
    }
    
    .discount-badge {
      font-size: 0.75rem;
      font-weight: 700;
      background-color: $danger;
      color: white;
      padding: 2px 6px;
      border-radius: $border-radius-sm;
      text-transform: uppercase;
    }
  `]
})
export class PriceTagComponent {
  @Input({ required: true }) price!: number;
  @Input() originalPrice?: number;

  readonly hasDiscount = computed(() => {
    return this.originalPrice !== undefined && this.originalPrice > this.price;
  });

  readonly discountPercent = computed(() => {
    if (!this.hasDiscount() || !this.originalPrice) return 0;
    const diff = this.originalPrice - this.price;
    return Math.round((diff / this.originalPrice) * 100);
  });
}
