import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, map } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { CategoryDto } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.baseUrl}/api/v1/Categories`;
  private readonly CATEGORIES_KEY = 'elwasl_mock_categories';

  getCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(this.baseUrl).pipe(
      map(res => {
        if (res && res.length > 0) {
          localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(res));
          return res;
        }
        return this.getStoredCategories();
      }),
      catchError(() => {
        return of(this.getStoredCategories());
      })
    );
  }

  private getStoredCategories(): CategoryDto[] {
    const raw = localStorage.getItem(this.CATEGORIES_KEY);
    if (raw) {
      try {
        return JSON.parse(raw) as CategoryDto[];
      } catch {}
    }
    const initial: CategoryDto[] = [
      { id: 'cat-1', nameAr: 'روايات وروايات مصورة', nameEn: 'Novels & Graphic Novels', slug: 'novels' },
      { id: 'cat-2', nameAr: 'كتب صوتية فاخرة', nameEn: 'Premium Audiobooks', slug: 'audiobooks' },
      { id: 'cat-3', nameAr: 'ألعاب ورقية ممتعة', nameEn: 'Card Games', slug: 'games' }
    ];
    localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(initial));
    return initial;
  }
}
