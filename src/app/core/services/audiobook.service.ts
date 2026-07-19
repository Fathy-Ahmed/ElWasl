import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { AudiobookDto, AudiobookDtoPaginatedList } from '../models/api.models';
import { Product } from '../../shared/components/product-card/product-card.component';

@Injectable({
  providedIn: 'root'
})
export class AudiobookService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.baseUrl}/api/v1/Audiobooks`;

  getAudiobooks(searchTerm?: string, pageNumber = 1, pageSize = 20): Observable<AudiobookDtoPaginatedList> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }

    return this.http.get<AudiobookDtoPaginatedList>(this.baseUrl, { params });
  }

  getAudiobooksAsProducts(searchTerm?: string): Observable<Product[]> {
    return this.getAudiobooks(searchTerm, 1, 100).pipe(
      map(res => (res.items || []).map(a => this.mapAudiobookToProduct(a)))
    );
  }

  getAudiobookById(id: string): Observable<Product> {
    return this.http.get<AudiobookDto>(`${this.baseUrl}/${id}`).pipe(
      map(a => this.mapAudiobookToProduct(a))
    );
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
      slug: audiobook.id, // Routing by ID
      descriptionAr: audiobook.descriptionAr || '',
      descriptionEn: audiobook.descriptionEn || ''
    };
  }
}
