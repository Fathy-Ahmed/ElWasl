import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { AudiobookDto, AudiobookDtoPaginatedList } from '../models/api.models';
import { Product } from '../../shared/components/product-card/product-card.component';

@Injectable({
  providedIn: 'root'
})
export class AudiobookService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.baseUrl}/api/v1/Audiobooks`;
  private readonly AUDIOBOOKS_KEY = 'elwasl_admin_mock_audiobooks';

  getAudiobooks(searchTerm?: string, pageNumber = 1, pageSize = 20): Observable<AudiobookDtoPaginatedList> {
    let items = this.getStoredAudiobooks();
    items = items.filter((a: any) => a.isActive !== false);

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      items = items.filter((a: any) => 
        (a.titleAr && a.titleAr.toLowerCase().includes(s)) ||
        (a.titleEn && a.titleEn.toLowerCase().includes(s)) ||
        (a.narratorName && a.narratorName.toLowerCase().includes(s))
      );
    }
    const start = (pageNumber - 1) * pageSize;
    const paginated = items.slice(start, start + pageSize);

    return of({
      items: paginated,
      pageNumber,
      pageSize,
      totalCount: items.length,
      totalPages: Math.ceil(items.length / pageSize),
      hasPreviousPage: pageNumber > 1,
      hasNextPage: start + pageSize < items.length
    } as AudiobookDtoPaginatedList);
  }

  getAudiobooksAsProducts(searchTerm?: string): Observable<Product[]> {
    return this.getAudiobooks(searchTerm, 1, 100).pipe(
      map(res => (res.items || []).map(a => this.mapAudiobookToProduct(a)))
    );
  }

  getAudiobookById(id: string): Observable<Product> {
    const items = this.getStoredAudiobooks();
    const audio = items.find((a: any) => a.id === id);
    if (audio) {
      return of(this.mapAudiobookToProduct(audio));
    }
    return this.http.get<AudiobookDto>(`${this.baseUrl}/${id}`).pipe(
      map(a => this.mapAudiobookToProduct(a)),
      catchError(() => {
        return of(this.mapAudiobookToProduct(items[0]));
      })
    );
  }

  private getStoredAudiobooks(): AudiobookDto[] {
    const raw = localStorage.getItem(this.AUDIOBOOKS_KEY);
    if (raw) {
      try { return JSON.parse(raw) as AudiobookDto[]; } catch {}
    }
    const initial: any[] = [
      {
        id: 'audiobook-1',
        titleAr: 'رواية أولاد حارتنا',
        titleEn: 'Children of Gebelawi',
        narratorName: 'أحمد حجازي',
        coverImageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600',
        categoryId: 'cat-2',
        price: 150,
        priceUsd: 3.0,
        durationMinutes: 480,
        publishedDate: '2026-07-01',
        descriptionAr: 'كتاب صوتي رائع بصوت المعلق أحمد حجازي.',
        descriptionEn: 'A wonderful audiobook narrated by Ahmed Hegazi.',
        isActive: true
      }
    ];
    localStorage.setItem(this.AUDIOBOOKS_KEY, JSON.stringify(initial));
    return initial;
  }

  private mapAudiobookToProduct(audiobook: AudiobookDto): Product {
    return {
      id: audiobook.id,
      productType: 'Audiobook',
      titleAr: audiobook.titleAr || '',
      titleEn: audiobook.titleEn || '',
      price: audiobook.price,
      priceUsd: audiobook.priceUsd && audiobook.priceUsd > 0 ? audiobook.priceUsd : undefined,
      coverImage: audiobook.coverImageUrl || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600',
      authorAr: audiobook.narratorName || '',
      authorEn: audiobook.narratorName || '',
      slug: audiobook.id,
      descriptionAr: audiobook.descriptionAr || '',
      descriptionEn: audiobook.descriptionEn || ''
    };
  }
}
