import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LocalizedTextPipe } from '../../../shared/pipes/localized-text.pipe';

export interface Exhibition {
  id: string;
  titleAr: string;
  titleEn: string;
  dateAr: string;
  dateEn: string;
  locationAr: string;
  locationEn: string;
  descriptionAr: string;
  descriptionEn: string;
  status: 'active' | 'upcoming' | 'past';
  image: string;
}

@Component({
  selector: 'app-exhibition-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, MatButtonModule, MatIconModule, LocalizedTextPipe],
  templateUrl: './exhibition-list.component.html',
  styleUrls: ['./exhibition-list.component.scss']
})
export class ExhibitionListComponent {
  readonly exhibitions = signal<Exhibition[]>([
    {
      id: 'ex1',
      titleAr: 'معرض القاهرة الدولي للكتاب ٢٠٢٦',
      titleEn: 'Cairo International Book Fair 2026',
      dateAr: '٢٥ يناير - ٦ فبراير',
      dateEn: 'Jan 25 - Feb 06',
      locationAr: 'مركز مصر للمعارض الدولية',
      locationEn: 'Egypt International Exhibition Center',
      descriptionAr: 'شاركونا في أكبر عرس ثقافي في الشرق الأوسط. جناح دار الوصل صالة 1 جناح B12.',
      descriptionEn: 'Join us at the largest cultural event in the Middle East. ElWasl stand: Hall 1 Stand B12.',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'ex2',
      titleAr: 'معرض الشارقة الدولي للكتاب ٢٠٢٦',
      titleEn: 'Sharjah International Book Fair 2026',
      dateAr: '١ نوفمبر - ١٢ نوفمبر',
      dateEn: 'Nov 01 - Nov 12',
      locationAr: 'إكسبو الشارقة',
      locationEn: 'Expo Centre Sharjah',
      descriptionAr: 'جناح دار الوصل يضم أحدث إصداراتنا الحصرية من الروايات والألعاب التفاعلية.',
      descriptionEn: 'ElWasl booth featuring our latest exclusive novels and interactive card games.',
      status: 'upcoming',
      image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=800'
    }
  ]);
}
