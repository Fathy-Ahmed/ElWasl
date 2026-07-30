import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { BookDto, BookDtoPaginatedList } from '../models/api.models';
import { Product } from '../../shared/components/product-card/product-card.component';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.baseUrl}/api/v1/Books`;

  getBooks(categoryId?: string, searchTerm?: string, pageNumber = 1, pageSize = 20): Observable<BookDtoPaginatedList> {
    const raw = localStorage.getItem('elwasl_admin_mock_books');
    if (raw) {
      try {
        let items = JSON.parse(raw);
        items = items.filter((b: any) => b.isActive !== false);

        if (categoryId && categoryId !== 'all') {
          items = items.filter((b: any) => b.categoryId === categoryId);
        }
        if (searchTerm) {
          const s = searchTerm.toLowerCase();
          items = items.filter((b: any) => 
            (b.titleAr && b.titleAr.toLowerCase().includes(s)) ||
            (b.titleEn && b.titleEn.toLowerCase().includes(s)) ||
            (b.authorName && b.authorName.toLowerCase().includes(s))
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
        } as BookDtoPaginatedList);
      } catch {}
    }

    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (categoryId && categoryId !== 'all') {
      params = params.set('categoryId', categoryId);
    }
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }

    return this.http.get<BookDtoPaginatedList>(this.baseUrl, { params });
  }

  getBooksAsProducts(categoryId?: string, searchTerm?: string): Observable<Product[]> {
    return this.getBooks(categoryId, searchTerm, 1, 100).pipe(
      map(res => (res.items || []).map(b => this.mapBookToProduct(b)))
    );
  }

  getBookById(id: string): Observable<Product> {
    const raw = localStorage.getItem('elwasl_admin_mock_books');
    if (raw) {
      try {
        const items = JSON.parse(raw);
        const book = items.find((b: any) => b.id === id);
        if (book) {
          return of(this.mapBookToProduct(book));
        }
      } catch {}
    }
    return this.http.get<BookDto>(`${`${this.baseUrl}/${id}`}`).pipe(
      map(b => this.mapBookToProduct(b))
    );
  }

  private mapBookToProduct(book: BookDto): Product {
    const isDiscounted = book.discountPrice !== null && book.discountPrice !== undefined && book.discountPrice < book.price;
    const isDiscountedUsd = book.discountPriceUsd !== null && book.discountPriceUsd !== undefined && book.priceUsd !== undefined && book.priceUsd !== null && book.discountPriceUsd < book.priceUsd;
    
    let priceUsd: number | undefined = undefined;
    let originalPriceUsd: number | undefined = undefined;

    if (book.priceUsd !== undefined && book.priceUsd !== null && book.priceUsd > 0) {
      priceUsd = isDiscountedUsd ? book.discountPriceUsd! : book.priceUsd;
      originalPriceUsd = isDiscountedUsd ? book.priceUsd : undefined;
    }

    return {
      id: book.id,
      productType: 'Book',
      titleAr: book.titleAr || '',
      titleEn: book.titleEn || '',
      price: isDiscounted ? book.discountPrice! : book.price,
      originalPrice: isDiscounted ? book.price : undefined,
      priceUsd,
      originalPriceUsd,
      coverImage: book.coverImageUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600',
      authorAr: book.authorName || '',
      authorEn: book.authorName || '',
      slug: book.id, // Routing by ID
      category: book.categoryNameEn || book.categoryId,
      descriptionAr: book.descriptionAr || '',
      descriptionEn: book.descriptionEn || '',
      format: book.format || undefined
    };
  }
}
