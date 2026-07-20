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
    const lang = this.localeService.currentLocale();
    
    if (this.data.id === 'eshop') {
      if (lang === 'ar') {
        return 'مرحباً بكم في متجرنا الإلكتروني المتميز. نوفر لكم تشكيلة واسعة من أحدث الإصدارات الروائية، الكتب المطبوعة الفاخرة، الروايات العربية والعالمية الأكثر مبيعاً، والكتب الصوتية الممتعة، بالإضافة إلى ألعاب الورق الجماعية المبتكرة. نضمن لكم تجربة تسوق آمنة وسهلة مع شحن سريع وتوصيل مباشر لباب منزلكم.';
      }
      if (lang === 'fr') {
        return 'Bienvenue dans notre librairie en ligne de premier choix. Nous proposons une large sélection de nouveaux romans, de superbes éditions imprimées, des best-sellers de la littérature arabe et mondiale, des livres audio captivants ainsi que des jeux de cartes créatifs pour toute la famille. Profitez d\'une expérience d\'achat simple et sécurisée avec livraison rapide à domicile.';
      }
      return 'Welcome to our premium online bookstore. We offer a wide range of the latest novel releases, luxury print books, bestselling Arabic and international novels, entertaining audiobooks, and innovative board/card games. We guarantee a secure and easy shopping experience with fast shipping and direct home delivery.';
    }
    
    if (this.data.id === 'publishing') {
      if (lang === 'ar') {
        return 'هل أنت مؤلف ولديك رواية أو كتاب تبحث عن نشره وتوزيعه؟ نحن في دار الوصل نقدم لك باقة متكاملة من الخدمات الاحترافية: التحرير الأدبي والتدقيق اللغوي، التنسيق والتصميم الداخلي، تصميم الأغلفة الجذابة والمبتكرة، الطباعة الفاخرة بجودة عالية، والتوزيع الواسع في المعارض والمكتبات العربية والعالمية. انضم لعائلة كتابنا المتميزين اليوم!';
      }
      if (lang === 'fr') {
        return 'Vous êtes auteur et souhaitez publier votre ouvrage ? Dar ElWasl vous propose un accompagnement professionnel complet : correction et révision éditoriale, mise en page, conception de couvertures attrayantes, impression haute qualité et large distribution dans les librairies et salons du livre. Rejoignez notre communauté d\'auteurs dès aujourd\'hui !';
      }
      return 'Are you an author with a novel or book seeking publication and distribution? At ElWasl, we offer a comprehensive package of professional services: literary editing and proofreading, interior layout design, eye-catching cover design, premium quality printing, and wide distribution in book fairs and libraries worldwide. Join our family of authors today!';
    }
    
    if (this.data.id === 'fairs') {
      if (lang === 'ar') {
        return 'تتواجد إصدارات دار الوصل في كبرى المكتبات ومنافذ التوزيع العربية المعتمدة. كما نسعد بلقائكم سنوياً والمشاركة الفعالة في كبرى المعارض الدولية للكتاب (معرض القاهرة الدولي، معرض الرياض، معرض الشارقة، ومعرض أبوظبي الدولي للكتاب). نوفر من خلال منافذنا خيارات ميسرة للحصول على كتبنا المطبوعة وألعابنا أينما كنتم.';
      }
      if (lang === 'fr') {
        return 'Les publications de Dar ElWasl sont disponibles dans les plus grandes librairies et réseaux de distribution. Nous sommes ravis de vous rencontrer chaque année lors des salons internationaux du livre (Le Caire, Riyad, Sharjah, Abou Dabi). Nos points de distribution facilitent l\'accès à nos ouvrages papier et jeux où que vous soyez.';
      }
      return 'ElWasl publications are available in major certified Arab bookstores and distribution outlets. We are also pleased to meet you annually through our active participation in major international book fairs (Cairo, Riyadh, Sharjah, and Abu Dhabi International Book Fairs). We provide easy access to our print books and games wherever you are.';
    }

    // Default fallback if admin added custom services
    return lang === 'ar' ? this.data.descAr : (lang === 'fr' && this.data.descFr ? this.data.descFr : this.data.descEn);
  }

  getActionText(): string {
    const lang = this.localeService.currentLocale();
    
    if (this.data.id === 'eshop') {
      if (lang === 'ar') return 'تسوق الآن / الذهاب للمتجر';
      if (lang === 'fr') return 'Acheter maintenant / Boutique';
      return 'Shop Now / Go to E-Shop';
    }
    if (this.data.id === 'publishing') {
      if (lang === 'ar') return 'انشر معنا / تقديم طلب تعاقد';
      if (lang === 'fr') return 'Publier avec nous / Contrat';
      return 'Publish With Us / Contracting';
    }
    if (this.data.id === 'fairs') {
      if (lang === 'ar') return 'عرض الفروع والموزعين';
      if (lang === 'fr') return 'Points de vente & Carte';
      return 'View Outlets & Map';
    }
    
    if (lang === 'ar') return 'المزيد من التفاصيل';
    if (lang === 'fr') return 'Plus de détails';
    return 'More Details';
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
      this.router.navigate(['/exhibitions']);
    } else if (this.data.id === 'publishing') {
      this.router.navigate(['/contract-with-us']);
    } else if (this.data.id === 'eshop') {
      this.router.navigate(['/books']);
    }
  }
}
