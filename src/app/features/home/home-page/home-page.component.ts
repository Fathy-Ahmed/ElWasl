import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Product, ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { BookService } from '../../../core/services/book.service';
import { LocaleService } from '../../../core/i18n/locale.service';
import { LocalizedTextPipe } from '../../../shared/pipes/localized-text.pipe';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    ProductCardComponent,
    LocalizedTextPipe
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  private readonly bookService = inject(BookService);
  readonly localeService = inject(LocaleService);

  featuredProducts: Product[] = [];

  // Premium mock data for landing page
  readonly defaultProducts: Product[] = [
    {
      id: 'b1',
      productType: 'Book',
      titleAr: 'أولاد حارتنا',
      titleEn: 'Children of Gebelawi',
      price: 120,
      originalPrice: 150,
      coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
      authorAr: 'نجيب محفوظ',
      authorEn: 'Naguib Mahfouz',
      genreAr: 'رواية واقعية',
      genreEn: 'Realism Novel',
      slug: 'children-of-gebelawi'
    },
    {
      id: 'b2',
      productType: 'Book',
      titleAr: 'الفيل الأزرق',
      titleEn: 'The Blue Elephant',
      price: 150,
      coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600',
      authorAr: 'أحمد مراد',
      authorEn: 'Ahmed Mourad',
      genreAr: 'غموض وتشويق',
      genreEn: 'Mystery/Thriller',
      slug: 'the-blue-elephant'
    },
    {
      id: 'b3',
      productType: 'Book',
      titleAr: 'قواعد العشق الأربعون',
      titleEn: 'The Forty Rules of Love',
      price: 185,
      originalPrice: 220,
      coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=600',
      authorAr: 'إليف شافاق',
      authorEn: 'Elif Shafak',
      genreAr: 'رواية فلسفية',
      genreEn: 'Philosophical',
      slug: 'forty-rules-of-love'
    },
    {
      id: 'b4',
      productType: 'Book',
      titleAr: 'ثلاثية غرناطة',
      titleEn: 'Granada Trilogy',
      price: 210,
      coverImage: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600',
      authorAr: 'رضوى عاشور',
      authorEn: 'Radwa Ashour',
      genreAr: 'رواية تاريخية',
      genreEn: 'Historical Fiction',
      slug: 'granada-trilogy'
    },
    {
      id: 'b5',
      productType: 'Book',
      titleAr: 'يوتوبيا',
      titleEn: 'Utopia',
      price: 110,
      originalPrice: 140,
      coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600',
      authorAr: 'أحمد خالد توفيق',
      authorEn: 'Ahmed Khaled Towfik',
      genreAr: 'خيال علمي',
      genreEn: 'Sci-Fi Dystopian',
      slug: 'utopia'
    },
    {
      id: 'b6',
      productType: 'Book',
      titleAr: 'موسم الهجرة إلى الشمال',
      titleEn: 'Season of Migration to the North',
      price: 130,
      coverImage: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&q=80&w=600',
      authorAr: 'الطيب صالح',
      authorEn: 'Tayeb Salih',
      genreAr: 'دراما اجتماعية',
      genreEn: 'Drama Novel',
      slug: 'migration-to-the-north'
    },
    {
      id: 'b7',
      productType: 'Book',
      titleAr: 'عزازيل',
      titleEn: 'Azazeel',
      price: 175,
      originalPrice: 200,
      coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600',
      authorAr: 'يوسف زيدان',
      authorEn: 'Youssef Ziedan',
      genreAr: 'رواية تاريخية',
      genreEn: 'Historical',
      slug: 'azazeel'
    },
    {
      id: 'b8',
      productType: 'Book',
      titleAr: 'تراب الماس',
      titleEn: 'Diamond Dust',
      price: 160,
      coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=600',
      authorAr: 'أحمد مراد',
      authorEn: 'Ahmed Mourad',
      genreAr: 'جريمة وغموض',
      genreEn: 'Crime Mystery',
      slug: 'diamond-dust'
    },
    {
      id: 'b9',
      productType: 'Book',
      titleAr: 'أرض الإله',
      titleEn: 'Land of God',
      price: 145,
      coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=600',
      authorAr: 'أحمد مراد',
      authorEn: 'Ahmed Mourad',
      genreAr: 'مغامرة وتاريخ',
      genreEn: 'Historical Adventure',
      slug: 'land-of-god'
    },
    {
      id: 'b10',
      productType: 'Book',
      titleAr: 'في قلبي أنثى عبرية',
      titleEn: 'In My Heart an Hebrew Female',
      price: 140,
      originalPrice: 170,
      coverImage: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=600',
      authorAr: 'خولة حمدي',
      authorEn: 'Khawla Hamdi',
      genreAr: 'دراما ورومانسية',
      genreEn: 'Drama/Romance',
      slug: 'in-my-heart-hebrew'
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

  // News mock data
  readonly newsItems = [
    {
      id: 'n1',
      titleAr: 'دار الوصل تفوز بجائزة أفضل ناشر عربي لعام 2025',
      titleEn: 'Dar ElWasl Wins Best Arab Publisher Award for 2025',
      dateAr: '15 يونيو 2026',
      dateEn: 'June 15, 2026',
      descAr: 'حصدت الدار الجائزة الذهبية لجمعية الناشرين للتميز الأدبي ودورها الريادي في تقديم محتوى روائي متميز يدعم الوجوه الشابة.',
      descEn: 'The publishing house won the Publishers Association Golden Award for literary excellence and its leading role in providing outstanding novel content supporting young authors.',
      imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=300'
    },
    {
      id: 'n2',
      titleAr: 'إطلاق شراكة حصرية مع منصة إنتاج وتوزيع الكتب الصوتية',
      titleEn: 'Exclusive Partnership with Audiobooks Production & Distribution Platform',
      dateAr: '8 يونيو 2026',
      dateEn: 'June 8, 2026',
      descAr: 'يسر دار الوصل الإعلان عن توفير جميع إصداراتها الروائية بصيغة صوتية عبر شراكة استراتيجية تبدأ هذا الشهر بصوت نخبة من الفنانين.',
      descEn: 'Dar ElWasl is pleased to announce that all its novel releases will be available in audio format starting this month through a strategic partnership.',
      imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=300'
    },
    {
      id: 'n3',
      titleAr: 'توقيع رواية "أرض الإله" للكاتب أحمد مراد في مقر الدار',
      titleEn: 'Book Signing of "Land of God" by Ahmed Mourad at the Headquarters',
      dateAr: '28 مايو 2026',
      dateEn: 'May 28, 2026',
      descAr: 'شهد حفل التوقيع إقبالاً كبيراً من القراء، وتحدث الكاتب عن كواليس العمل والبحث التاريخي الطويل وراء الرواية.',
      descEn: 'The book signing ceremony saw great turnout from readers. The author spoke about behind-the-scenes work and the extensive historical research.',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300'
    }
  ];

  // Bestsellers mock data (subset for slider)
  bestsellers: Product[] = [];

  // Mock authors with detailed portrait images
  readonly authors = [
    {
      nameAr: 'نجيب محفوظ',
      nameEn: 'Naguib Mahfouz',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      countAr: '42 رواية',
      countEn: '42 Novels'
    },
    {
      nameAr: 'أحمد مراد',
      nameEn: 'Ahmed Mourad',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      countAr: '9 روايات',
      countEn: '9 Novels'
    },
    {
      nameAr: 'رضوى عاشور',
      nameEn: 'Radwa Ashour',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      countAr: '15 كتاباً',
      countEn: '15 Books'
    },
    {
      nameAr: 'الطيب صالح',
      nameEn: 'Tayeb Salih',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
      countAr: '6 روايات',
      countEn: '6 Novels'
    },
    {
      nameAr: 'أحمد خالد توفيق',
      nameEn: 'Ahmed Khaled Towfik',
      photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150',
      countAr: '80 كتاباً',
      countEn: '80 Books'
    },
    {
      nameAr: 'خولة حمدي',
      nameEn: 'Khawla Hamdi',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      countAr: '7 روايات',
      countEn: '7 Novels'
    },
    {
      nameAr: 'يوسف زيدان',
      nameEn: 'Youssef Ziedan',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
      countAr: '18 كتاباً',
      countEn: '18 Books'
    },
    {
      nameAr: 'إليف شافاق',
      nameEn: 'Elif Shafak',
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
      countAr: '12 رواية',
      countEn: '12 Novels'
    }
  ];

  ngOnInit(): void {
    this.featuredProducts = this.defaultProducts; // Initialize with fallback data
    this.updateBestsellers();
    this.loadFeaturedProducts();
  }

  private loadFeaturedProducts(): void {
    this.bookService.getBooksAsProducts().subscribe({
      next: (products) => {
        if (products && products.length > 0) {
          this.featuredProducts = products.slice(0, 10);
          this.updateBestsellers();
        }
      },
      error: (err) => {
        console.warn('Could not load books from backend database, using static fallback.', err);
        this.updateBestsellers();
      }
    });
  }

  private updateBestsellers(): void {
    if (this.featuredProducts && this.featuredProducts.length > 0) {
      const indices = [1, 3, 7, 2, 9];
      const selected = indices
        .map(i => this.featuredProducts[i])
        .filter(p => p !== undefined && p !== null);
      
      if (selected.length > 0) {
        this.bestsellers = selected;
      } else {
        this.bestsellers = [...this.featuredProducts];
      }
    } else {
      this.bestsellers = [];
    }
  }
}
