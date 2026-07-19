import { CommonModule } from '@angular/common';
import { Component, Input, computed } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [ngStyle]="badgeStyles()">
      {{ label || status }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 12px;
      text-transform: uppercase;
      text-align: center;
      white-space: nowrap;
    }
  `]
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: string;
  @Input() label?: string;
  @Input() customColorMap?: { [key: string]: { bg: string; text: string } };

  private readonly defaultColorMap: { [key: string]: { bg: string; text: string } } = {
    active: { bg: '#e6f4ea', text: '#137333' },     // Green
    delivered: { bg: '#e6f4ea', text: '#137333' },
    completed: { bg: '#e6f4ea', text: '#137333' },
    
    pending: { bg: '#fef7e0', text: '#b06000' },       // Amber
    under_review: { bg: '#e8f0fe', text: '#1a73e8' },   // Blue
    shipped: { bg: '#e8f0fe', text: '#1a73e8' },       // Blue
    
    canceled: { bg: '#fce8e6', text: '#c5221f' },      // Red
    rejected: { bg: '#fce8e6', text: '#c5221f' },
    failed: { bg: '#fce8e6', text: '#c5221f' },
    
    inactive: { bg: '#f1f3f4', text: '#3c4043' }       // Gray
  };

  readonly badgeStyles = computed(() => {
    const map = this.customColorMap || this.defaultColorMap;
    const normalizedStatus = this.status.toLowerCase().trim();
    
    const config = map[normalizedStatus] || { bg: '#f1f3f4', text: '#3c4043' };
    return {
      'background-color': config.bg,
      color: config.text
    };
  });
}
