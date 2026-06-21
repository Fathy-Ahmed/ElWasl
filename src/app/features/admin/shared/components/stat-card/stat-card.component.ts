import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="stat-card">
      <div class="card-left">
        <span class="label">{{ label }}</span>
        <h3 class="value">{{ value }}</h3>
        
        @if (trendValue !== undefined) {
          <div class="trend-block" [ngClass]="trendType || 'up'">
            <mat-icon class="trend-icon">
              {{ (trendType === 'down') ? 'trending_down' : 'trending_up' }}
            </mat-icon>
            <span class="trend-val">{{ trendValue }}%</span>
            <span class="trend-desc">مقارنة بالشهر السابق / vs last month</span>
          </div>
        }
      </div>

      <div class="card-right" *ngIf="icon">
        <div class="icon-wrapper">
          <mat-icon>{{ icon }}</mat-icon>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import '../../../../../../styles/variables';
    @import '../../../../../../styles/mixins';

    .stat-card {
      background-color: white;
      border: 1px solid $border-color;
      border-radius: $border-radius;
      padding: 1.5rem;
      box-shadow: $shadow-sm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: $transition-fast;
      
      &:hover {
        box-shadow: $shadow-md;
        border-color: rgba($primary-light, 0.3);
      }
    }

    .card-left {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      
      .label {
        font-size: 0.85rem;
        font-weight: 600;
        color: $text-muted;
      }
      
      .value {
        font-size: 1.75rem;
        font-weight: 800;
        color: $primary-dark;
      }
    }

    .trend-block {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      font-weight: 700;
      
      .trend-icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
        @include flex-center;
      }
      
      .trend-desc {
        color: $text-muted;
        font-weight: 500;
        margin-inline-start: 4px;
      }
      
      &.up {
        color: $success;
      }
      
      &.down {
        color: $danger;
      }
    }

    .card-right {
      .icon-wrapper {
        background-color: rgba($primary-light, 0.08);
        color: $primary-color;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        @include flex-center;
        
        mat-icon {
          font-size: 1.5rem;
          width: 1.5rem;
          height: 1.5rem;
        }
      }
    }
  `]
})
export class StatCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string;
  @Input() icon?: string;
  @Input() trendValue?: number;
  @Input() trendType?: 'up' | 'down';
}
