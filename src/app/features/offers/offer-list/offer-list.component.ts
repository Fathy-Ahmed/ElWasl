import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TranslateModule } from '@ngx-translate/core';
import { Product, ProductCardComponent } from '../../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-offer-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatButtonToggleModule, ProductCardComponent],
  templateUrl: './offer-list.component.html',
  styleUrls: ['./offer-list.component.scss']
})
export class OfferListComponent {
  readonly selectedOfferType = signal<string>('all');

  readonly offerProducts = signal<(Product & { offerType: string })[]>([
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
      slug: 'granada-trilogy',
      offerType: 'summer'
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
      slug: 'muqaddimah-audio',
      offerType: 'winter'
    },
    {
      id: 'g2',
      productType: 'Game',
      titleAr: 'المحقق الذكي - لعبة تحدي الذكاء',
      titleEn: 'Smart Detective - IQ Challenge',
      price: 149,
      originalPrice: 175,
      coverImage: 'https://images.unsplash.com/photo-1612404730960-5c71577fca16?auto=format&fit=crop&q=80&w=600',
      authorAr: 'ألعاب الوصل',
      authorEn: 'Wasl Games',
      slug: 'smart-detective',
      offerType: 'novel'
    }
  ]);

  readonly filteredProducts = computed(() => {
    const type = this.selectedOfferType();
    if (type === 'all') {
      return this.offerProducts();
    }
    return this.offerProducts().filter(p => p.offerType === type);
  });

  setOfferType(type: string): void {
    this.selectedOfferType.set(type);
  }
}
