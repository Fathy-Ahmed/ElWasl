import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { LocalizedTextPipe } from '../../../shared/pipes/localized-text.pipe';
import { LocaleService } from '../../../core/i18n/locale.service';

@Component({
  selector: 'app-service-detail-dialog',
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
    <div class="service-dialog-container" [dir]="localeService.isRtl() ? 'rtl' : 'ltr'">
      <div class="dialog-header">
        <div class="title-with-icon">
          <mat-icon class="service-dialog-icon">{{ data.icon }}</mat-icon>
          <h2 mat-dialog-title class="dialog-title">{{ data | localizedText:'title' }}</h2>
        </div>
        <button mat-icon-button (click)="close()" class="close-btn" aria-label="Close dialog">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      
      <mat-dialog-content class="dialog-content">
        <p class="service-details-text">{{ getServiceDetails() }}</p>
      </mat-dialog-content>
      
      <mat-dialog-actions [align]="localeService.isRtl() ? 'start' : 'end'" class="dialog-actions">
        <button mat-flat-button color="accent" (click)="onActionClick()" class="action-btn">
          <mat-icon>{{ getActionIcon() }}</mat-icon>
          {{ getActionText() }}
        </button>
        <button mat-button (click)="close()">
          {{ 'COMMON.CLOSE' | translate }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .service-dialog-container {
      padding: 16px;
    }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 1px solid rgba(0,0,0,0.08);
      padding-bottom: 12px;
    }
    .title-with-icon {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .service-dialog-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #F57C00;
    }
    .dialog-title {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 800;
      color: #3e2723;
    }
    .close-btn {
      color: #8d6e63;
    }
    .dialog-content {
      margin-top: 8px;
      max-height: 60vh;
      overflow-y: auto;
    }
    .service-details-text {
      font-size: 1.05rem;
      line-height: 1.7;
      color: #4e342e;
      margin: 0;
      text-align: justify;
    }
    .dialog-actions {
      border-top: 1px solid rgba(0,0,0,0.08);
      margin-top: 20px;
      padding-top: 12px;
      gap: 8px;
    }
    .action-btn {
      font-weight: 700;
      border-radius: 20px;
      box-shadow: 0 4px 10px rgba(245, 124, 0, 0.2);
    }
  `]
})
export class ServiceDetailDialogComponent {
  readonly localeService = inject(LocaleService);
  private readonly router = inject(Router);

  constructor(
    public dialogRef: MatDialogRef<ServiceDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  getServiceDetails(): string {
    const isRtl = this.localeService.isRtl();
    
    if (this.data.id === 'eshop') {
      return isRtl 
        ? 'مرحباً بكم في متجرنا الإلكتروني المتميز. نوفر لكم تشكيلة واسعة من أحدث الإصدارات الروائية، الكتب المطبوعة الفاخرة، الروايات العربية والعالمية الأكثر مبيعاً، والكتب الصوتية الممتعة، بالإضافة إلى ألعاب الورق الجماعية المبتكرة. نضمن لكم تجربة تسوق آمنة وسهلة مع شحن سريع وتوصيل مباشر لباب منزلكم.'
        : 'Welcome to our premium online bookstore. We offer a wide range of the latest novel releases, luxury print books, bestselling Arabic and international novels, entertaining audiobooks, and innovative board/card games. We guarantee a secure and easy shopping experience with fast shipping and direct home delivery.';
    }
    
    if (this.data.id === 'publishing') {
      return isRtl
        ? 'هل أنت مؤلف ولديك رواية أو كتاب تبحث عن نشره وتوزيعه؟ نحن في دار الوصل نقدم لك باقة متكاملة من الخدمات الاحترافية: التحرير الأدبي والتدقيق اللغوي، التنسيق والتصميم الداخلي، تصميم الأغلفة الجذابة والمبتكرة، الطباعة الفاخرة بجودة عالية، والتوزيع الواسع في المعارض والمكتبات العربية والعالمية. انضم لعائلة كتابنا المتميزين اليوم!'
        : 'Are you an author with a novel or book seeking publication and distribution? At ElWasl, we offer a comprehensive package of professional services: literary editing and proofreading, interior layout design, eye-catching cover design, premium quality printing, and wide distribution in book fairs and libraries worldwide. Join our family of authors today!';
    }
    
    if (this.data.id === 'fairs') {
      return isRtl
        ? 'تتواجد إصدارات دار الوصل في كبرى المكتبات ومنافذ التوزيع العربية المعتمدة. كما نسعد بلقائكم سنوياً والمشاركة الفعالة في كبرى المعارض الدولية للكتاب (معرض القاهرة الدولي، معرض الرياض، معرض الشارقة، ومعرض أبوظبي الدولي للكتاب). نوفر من خلال منافذنا خيارات ميسرة للحصول على كتبنا المطبوعة وألعابنا أينما كنتم.'
        : 'ElWasl publications are available in major certified Arab bookstores and distribution outlets. We are also pleased to meet you annually through our active participation in major international book fairs (Cairo, Riyadh, Sharjah, and Abu Dhabi International Book Fairs). We provide easy access to our print books and games wherever you are.';
    }

    // Default fallback if admin added custom services
    return isRtl ? this.data.descAr : this.data.descEn;
  }

  getActionText(): string {
    const isRtl = this.localeService.isRtl();
    
    if (this.data.id === 'eshop') {
      return isRtl ? 'تسوق الآن / الذهاب للمتجر' : 'Shop Now / Go to E-Shop';
    }
    if (this.data.id === 'publishing') {
      return isRtl ? 'انشر معنا / تقديم طلب تعاقد' : 'Publish With Us / Contracting';
    }
    if (this.data.id === 'fairs') {
      return isRtl ? 'عرض الفروع والموزعين' : 'View Outlets & Map';
    }
    
    return isRtl ? 'المزيد من التفاصيل' : 'More Details';
  }

  getActionIcon(): string {
    if (this.data.id === 'eshop') return 'shopping_bag';
    if (this.data.id === 'publishing') return 'rate_review';
    if (this.data.id === 'fairs') return 'map';
    return 'info';
  }

  onActionClick(): void {
    this.dialogRef.close();
    if (this.data.id === 'fairs') {
      const element = document.getElementById('home-map-block');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (this.data.id === 'publishing') {
      this.router.navigate(['/contract-with-us']);
    } else if (this.data.id === 'eshop') {
      this.router.navigate(['/books']);
    }
  }
}
