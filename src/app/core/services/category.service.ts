import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { CategoryDto } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.baseUrl}/api/v1/Categories`;

  getCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(this.baseUrl).pipe(
      catchError(() => of([
        { id: 'cat-1', nameAr: 'روايات وروايات مصورة', nameEn: 'Novels & Graphic Novels', slug: 'novels' },
        { id: 'cat-2', nameAr: 'كتب صوتية فاخرة', nameEn: 'Premium Audiobooks', slug: 'audiobooks' },
        { id: 'cat-3', nameAr: 'ألعاب ورقية ممتعة', nameEn: 'Card Games', slug: 'games' }
      ]))
    );
  }
}
