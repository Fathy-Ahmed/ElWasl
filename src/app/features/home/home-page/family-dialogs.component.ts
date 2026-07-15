import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { LocalizedTextPipe } from '../../../shared/pipes/localized-text.pipe';
import { LocaleService } from '../../../core/i18n/locale.service';

@Component({
  selector: 'app-author-dialog',
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
    <div class="family-dialog-container" [dir]="localeService.isRtl() ? 'rtl' : 'ltr'">
      <div class="dialog-header">
        <h2 mat-dialog-title class="dialog-title">{{ data | localizedText:'name' }}</h2>
        <button mat-icon-button (click)="close()" class="close-btn" aria-label="Close dialog">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      
      <mat-dialog-content class="dialog-content">
        <div class="author-avatar-box">
          <img [src]="data.photo" [alt]="data | localizedText:'name'" class="author-avatar">
        </div>
        
        <div class="author-badge">
          <mat-icon>menu_book</mat-icon>
          <span>{{ data | localizedText:'count' }}</span>
        </div>
        
        <p class="author-bio">{{ data | localizedText:'bio' }}</p>
      </mat-dialog-content>
      
      <mat-dialog-actions [align]="localeService.isRtl() ? 'start' : 'end'" class="dialog-actions">
        <button mat-flat-button color="primary" (click)="close()">
          {{ 'COMMON.CLOSE' | translate }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .family-dialog-container {
      padding: 16px;
    }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
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
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 12px;
      max-height: 60vh;
      overflow-y: auto;
    }
    .author-avatar-box {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      overflow: hidden;
      margin-bottom: 12px;
      border: 3px solid #f57c00;
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    .author-avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .author-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background-color: #ffe0b2;
      color: #e65100;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 0.95rem;
      font-weight: bold;
      margin-bottom: 16px;
    }
    .author-badge mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .author-bio {
      font-size: 1.05rem;
      line-height: 1.6;
      color: #3e2723;
      text-align: center;
      max-width: 90%;
      margin: 0;
    }
    .dialog-actions {
      border-top: 1px solid rgba(0,0,0,0.08);
      margin-top: 16px;
      padding-top: 8px;
    }
  `]
})
export class AuthorDialogComponent {
  readonly localeService = inject(LocaleService);
  constructor(
    public dialogRef: MatDialogRef<AuthorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  close(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-distributor-dialog',
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
    <div class="family-dialog-container" [dir]="localeService.isRtl() ? 'rtl' : 'ltr'">
      <div class="dialog-header">
        <h2 mat-dialog-title class="dialog-title">{{ data | localizedText:'name' }}</h2>
        <button mat-icon-button (click)="close()" class="close-btn" aria-label="Close dialog">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      
      <mat-dialog-content class="dialog-content">
        <div class="distributor-details">
          <div class="detail-item" *ngIf="data.addressAr">
            <mat-icon class="icon-address">location_on</mat-icon>
            <div class="detail-text">
              <strong class="detail-label">{{ 'CONTACT.ADDRESS' | translate }}:</strong>
              <span>{{ data | localizedText:'address' }}</span>
            </div>
          </div>
          
          <div class="detail-item" *ngIf="data.phone">
            <mat-icon class="icon-phone">phone</mat-icon>
            <div class="detail-text">
              <strong class="detail-label">{{ 'CONTACT.PHONE' | translate }}:</strong>
              <span class="ltr-text">{{ data.phone }}</span>
            </div>
          </div>
          
          <div class="detail-item" *ngIf="data.email">
            <mat-icon class="icon-email">email</mat-icon>
            <div class="detail-text">
              <strong class="detail-label">{{ 'CONTACT.EMAIL' | translate }}:</strong>
              <span>{{ data.email }}</span>
            </div>
          </div>
          
          <div class="detail-item" *ngIf="data.hoursAr">
            <mat-icon class="icon-hours">schedule</mat-icon>
            <div class="detail-text">
              <strong class="detail-label">مواعيد العمل / Hours:</strong>
              <span>{{ data | localizedText:'hours' }}</span>
            </div>
          </div>

          <div class="detail-item map-link-item" style="margin-top: 8px;">
            <mat-icon style="color: #F57C00;">map</mat-icon>
            <div class="detail-text">
              <strong class="detail-label">الخريطة / Map:</strong>
              <a [href]="getMapsUrl()" target="_blank" rel="noopener noreferrer" class="map-link-btn" style="color: #F57C00; font-weight: bold; text-decoration: underline;">
                فتح في خرائط جوجل / Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </mat-dialog-content>
      
      <mat-dialog-actions [align]="localeService.isRtl() ? 'start' : 'end'" class="dialog-actions">
        <button mat-flat-button color="primary" (click)="close()">
          {{ 'COMMON.CLOSE' | translate }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .family-dialog-container {
      padding: 16px;
    }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
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
    .distributor-details {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .detail-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .detail-item mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      margin-top: 2px;
    }
    .icon-address { color: #f57c00; }
    .icon-phone { color: #2e7d32; }
    .icon-email { color: #1565c0; }
    .icon-hours { color: #ef6c00; }
    .detail-text {
      display: flex;
      flex-direction: column;
      font-size: 1.05rem;
      line-height: 1.5;
      color: #3e2723;
    }
    .detail-label {
      color: #5d4037;
      margin-bottom: 4px;
    }
    .ltr-text {
      direction: ltr;
      text-align: start;
    }
    .dialog-actions {
      border-top: 1px solid rgba(0,0,0,0.08);
      margin-top: 16px;
      padding-top: 8px;
    }
  `]
})
export class DistributorDialogComponent {
  readonly localeService = inject(LocaleService);
  constructor(
    public dialogRef: MatDialogRef<DistributorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  
  close(): void {
    this.dialogRef.close();
  }

  getMapsUrl(): string {
    if (this.data.id === 'd1' || this.data.email === 'elwaslbook2023@gmail.com') {
      return 'https://maps.app.goo.gl/Zg4CHwDNgW9nDEcy8?g_st=ic';
    }
    const query = encodeURIComponent(this.data.nameEn || this.data.addressEn || '');
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }
}

@Component({
  selector: 'app-all-distributors-dialog',
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
    <div class="family-dialog-container all-distributors-container" [dir]="localeService.isRtl() ? 'rtl' : 'ltr'">
      <div class="dialog-header">
        <h2 mat-dialog-title class="dialog-title">نقاط التوزيع والمنافذ / Distribution Areas</h2>
        <button mat-icon-button (click)="close()" class="close-btn" aria-label="Close dialog">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      
      <mat-dialog-content class="dialog-content scrollable-content">
        <div class="distributors-list">
          @for (dist of data; track dist.id; let idx = $index) {
            <div class="distributor-card">
              <h3 class="dist-name">{{ dist | localizedText:'name' }}</h3>
              
              <div class="dist-details-grid">
                <div class="detail-row" *ngIf="dist.addressAr">
                  <mat-icon>location_on</mat-icon>
                  <span>{{ dist | localizedText:'address' }}</span>
                </div>
                
                <div class="detail-row" *ngIf="dist.phone">
                  <mat-icon>phone</mat-icon>
                  <span class="ltr-text">{{ dist.phone }}</span>
                </div>
                
                <div class="detail-row" *ngIf="dist.email">
                  <mat-icon>email</mat-icon>
                  <span>{{ dist.email }}</span>
                </div>

                <div class="detail-row" *ngIf="dist.hoursAr">
                  <mat-icon>schedule</mat-icon>
                  <span>{{ dist | localizedText:'hours' }}</span>
                </div>
              </div>
              
              <div class="dist-action-row">
                <a [href]="getMapsUrl(dist)" target="_blank" rel="noopener noreferrer" mat-stroked-button color="accent" class="view-map-btn">
                  <mat-icon>map</mat-icon> فتح في خرائط جوجل / Open in Google Maps
                </a>
              </div>
            </div>
            @if (idx < data.length - 1) {
              <hr class="list-divider">
            }
          }
        </div>
      </mat-dialog-content>
      
      <mat-dialog-actions [align]="localeService.isRtl() ? 'start' : 'end'" class="dialog-actions">
        <button mat-flat-button color="primary" (click)="close()">
          {{ 'COMMON.CLOSE' | translate }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .all-distributors-container {
      padding: 16px;
      max-width: 600px;
    }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
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
    .dialog-content.scrollable-content {
      margin-top: 12px;
      max-height: 65vh;
      overflow-y: auto;
      padding-inline-end: 8px;
    }
    .distributors-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .distributor-card {
      background-color: #faf6eb;
      border: 1px solid rgba(212, 160, 23, 0.15);
      border-radius: 8px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.05);
      }
    }
    .dist-name {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 700;
      color: #e65100;
    }
    .dist-details-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .detail-row {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 0.95rem;
      color: #4e342e;
      
      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #d4a017;
        margin-top: 2px;
      }
    }
    .ltr-text {
      direction: ltr;
      text-align: start;
    }
    .dist-action-row {
      display: flex;
      justify-content: flex-end;
      margin-top: 4px;
    }
    .view-map-btn {
      border-radius: 16px;
      font-size: 0.85rem;
      font-weight: bold;
    }
    .list-divider {
      border: 0;
      border-top: 1px dashed rgba(212,160,23,0.2);
      margin: 4px 0;
    }
    .dialog-actions {
      border-top: 1px solid rgba(0,0,0,0.08);
      margin-top: 16px;
      padding-top: 8px;
    }
  `]
})
export class AllDistributorsDialogComponent {
  readonly localeService = inject(LocaleService);
  constructor(
    public dialogRef: MatDialogRef<AllDistributorsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any[]
  ) {}
  
  close(): void {
    this.dialogRef.close();
  }

  getMapsUrl(dist: any): string {
    if (dist.id === 'd1' || dist.email === 'elwaslbook2023@gmail.com') {
      return 'https://maps.app.goo.gl/Zg4CHwDNgW9nDEcy8?g_st=ic';
    }
    const query = encodeURIComponent(dist.nameEn || dist.addressEn || '');
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }
}
