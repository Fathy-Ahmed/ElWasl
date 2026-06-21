import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Product, ProductCardComponent } from '../../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    ProductCardComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {
  // Premium mock data for landing page
  readonly featuredProducts: Product[] = [
    {
      id: 'b1',
      productType: 'Book',
      titleAr: 'ثلاثية غرناطة',
      titleEn: 'Granada Trilogy',
      price: 180,
      originalPrice: 220,
      coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600',
      authorAr: 'رضوى عاشور',
      authorEn: 'Radwa Ashour',
      slug: 'granada-trilogy'
    },
    {
      id: 'b2',
      productType: 'Book',
      titleAr: 'الفيل الأزرق',
      titleEn: 'The Blue Elephant',
      price: 150,
      coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
      authorAr: 'أحمد مراد',
      authorEn: 'Ahmed Mourad',
      slug: 'the-blue-elephant'
    },
    {
      id: 'ab1',
      productType: 'Audiobook',
      titleAr: 'مقدمة ابن خلدون (كتاب صوتي)',
      titleEn: 'Muqaddimah (Audiobook)',
      price: 250,
      originalPrice: 350,
      coverImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600',
      authorAr: 'ابن خلدون',
      authorEn: 'Ibn Khaldun',
      slug: 'muqaddimah-audio'
    },
    {
      id: 'g1',
      productType: 'Game',
      titleAr: 'سؤال وجواب - لعبة العائلة',
      titleEn: 'Q&A - Family Edition',
      price: 199,
      coverImage: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&q=80&w=600',
      authorAr: 'ألعاب الوصل',
      authorEn: 'Wasl Games',
      slug: 'qa-family-game'
    }
  ];

  readonly currentExhibitions = [
    {
      id: 'ex1',
      titleAr: 'معرض القاهرة الدولي للكتاب ٢٠٢٦',
      titleEn: 'Cairo International Book Fair 2026',
      dateAr: '٢٥ يناير - ٦ فبراير',
      dateEn: 'Jan 25 - Feb 06',
      locationAr: 'مركز مصر للمعارض الدولية',
      locationEn: 'Egypt International Exhibition Center',
      descriptionAr: 'شاركونا في أكبر عرس ثقافي في الشرق الأوسط. جناح دار الوصل صالة 1 جناح B12.',
      descriptionEn: 'Join us at the largest cultural wedding in the Middle East. ElWasl stand: Hall 1 Stand B12.'
    }
  ];

  readonly promotions = [
    {
      id: 'p1',
      titleAr: 'عروض الصيف الحارة',
      titleEn: 'Sizzling Summer Offers',
      discountAr: 'خصومات تصل إلى ٥٠٪ على الروايات',
      discountEn: 'Up to 50% discount on selected novels',
      link: '/offers'
    }
  ];
}
