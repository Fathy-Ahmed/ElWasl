import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

export interface Breadcrumb {
  label: string;
  route?: string;
}

@Component({
  selector: 'app-admin-page-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-header-wrapper">
      <div class="header-titles">
        @if (breadcrumbs.length > 0) {
          <nav class="breadcrumbs">
            @for (bc of breadcrumbs; track bc.label; let last = $last) {
              @if (bc.route && !last) {
                <a [routerLink]="bc.route" class="breadcrumb-link">{{ bc.label }}</a>
              } @else {
                <span class="breadcrumb-current">{{ bc.label }}</span>
              }
              @if (!last) {
                <mat-icon class="bc-separator mirror-rtl">chevron_right</mat-icon>
              }
            }
          </nav>
        }
        <h1 class="page-title">{{ title }}</h1>
        @if (subtitle) {
          <p class="page-subtitle">{{ subtitle }}</p>
        }
      </div>

      <div class="header-actions" *ngIf="actionLabel">
        <button mat-flat-button color="primary" (click)="actionClick.emit()" id="header-action-btn">
          <mat-icon *ngIf="actionIcon">{{ actionIcon }}</mat-icon>
          <span>{{ actionLabel }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    @import '../../../../../../styles/variables';
    @import '../../../../../../styles/mixins';

    .page-header-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      border-bottom: 1px solid $border-color;
      padding-bottom: 1rem;
    }

    .header-titles {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .breadcrumbs {
      display: flex;
      align-items: center;
      font-size: 0.8rem;
      color: $text-muted;
      font-weight: 500;
      
      .breadcrumb-link {
        color: $primary-light;
        &:hover {
          text-decoration: underline;
        }
      }
      
      .bc-separator {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
        @include flex-center;
      }
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: $primary-dark;
      line-height: 1.2;
    }

    .page-subtitle {
      font-size: 0.9rem;
      color: $text-muted;
    }

    .header-actions {
      button {
        border-radius: 24px;
        font-weight: 700;
        height: auto;
        min-height: 42px;
        padding: 0.5rem 1.25rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
        gap: 0.5rem;

        span {
          white-space: nowrap;
        }
      }
    }
  `]
})
export class AdminPageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
  @Input() breadcrumbs: Breadcrumb[] = [];
  @Input() actionLabel?: string;
  @Input() actionIcon?: string;

  @Output() actionClick = new EventEmitter<void>();
}
