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
}
