import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chart-card-wrapper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-wrapper-card">
      <div class="card-header">
        <div class="header-titles">
          <h3 class="chart-title">{{ title }}</h3>
          <p class="chart-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
        </div>
      </div>
      
      <div class="card-body">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    @import '../../../../../../styles/variables';
    
    .chart-wrapper-card {
      background-color: white;
      border: 1px solid $border-color;
      border-radius: $border-radius;
      padding: 1.5rem;
      box-shadow: $shadow-sm;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      height: 100%;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 0.75rem;
    }

    .header-titles {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      
      .chart-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: $primary-dark;
      }
      
      .chart-subtitle {
        font-size: 0.8rem;
        color: $text-muted;
      }
    }

    .card-body {
      flex-grow: 1;
      position: relative;
      min-height: 250px;
    }
  `]
})
export class ChartCardWrapperComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
}
