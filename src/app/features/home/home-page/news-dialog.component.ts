import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { LocalizedTextPipe } from '../../../shared/pipes/localized-text.pipe';
import { LocaleService } from '../../../core/i18n/locale.service';

@Component({
  selector: 'app-news-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    LocalizedTextPipe
  ],
  template: `
    <div class="news-dialog-container" [dir]="localeService.isRtl() ? 'rtl' : 'ltr'">
      <div class="dialog-header">
        <h2 mat-dialog-title class="dialog-title">{{ data | localizedText:'title' }}</h2>
        <button mat-icon-button (click)="close()" class="close-btn" aria-label="Close dialog">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      
      <mat-dialog-content class="dialog-content">
        <div class="news-meta">
          <mat-icon>calendar_month</mat-icon>
          <span>{{ data | localizedText:'date' }}</span>
        </div>
        
        <div class="news-img-box" *ngIf="data.imageUrl">
          <img [src]="data.imageUrl" [alt]="data | localizedText:'title'" class="news-img">
        </div>
        
        <p class="news-desc">{{ data | localizedText:'desc' }}</p>
      </mat-dialog-content>
      
      <mat-dialog-actions [align]="localeService.isRtl() ? 'start' : 'end'" class="dialog-actions">
        <button mat-flat-button color="primary" (click)="close()">
          {{ 'COMMON.CLOSE' | translate }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .news-dialog-container {
      padding: 16px;
      font-family: inherit;
    }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      border-bottom: 1px solid rgba(0,0,0,0.08);
      padding-bottom: 8px;
    }
    .dialog-title {
      margin: 0;
      font-size: 1.3rem;
      font-weight: bold;
      color: #5d4037;
    }
    .close-btn {
      color: #8d6e63;
    }
    .dialog-content {
      margin-top: 12px;
      max-height: 60vh;
      overflow-y: auto;
    }
    .news-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #e65100;
      font-size: 0.9rem;
      margin-bottom: 12px;
      font-weight: 500;
    }
    .news-meta mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .news-img-box {
      width: 100%;
      max-height: 250px;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 16px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
    .news-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .news-desc {
      font-size: 1.05rem;
      line-height: 1.6;
      color: #3e2723;
      white-space: pre-line;
      margin: 0;
    }
    .dialog-actions {
      border-top: 1px solid rgba(0,0,0,0.08);
      margin-top: 16px;
      padding-top: 8px;
    }
  `]
})
export class NewsDialogComponent {
  readonly localeService = inject(LocaleService);

  constructor(
    public dialogRef: MatDialogRef<NewsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
