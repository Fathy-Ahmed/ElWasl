import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { BookDto, BookDtoPaginatedList } from '../models/api.models';
import { Product } from '../../shared/components/product-card/product-card.component';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.baseUrl}/api/v1/Books`;
  private readonly BOOKS_KEY = 'elwasl_admin_mock_books';

  getBooks(categoryId?: string, searchTerm?: string, pageNumber = 1, pageSize = 20): Observable<BookDtoPaginatedList> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (categoryId && categoryId !== 'all') {
      params = params.set('categoryId', categoryId);
    }
    if (searchTerm && searchTerm.trim()) {
      params = params.set('searchTerm', searchTerm.trim());
    }

    return this.http.get<BookDtoPaginatedList>(this.baseUrl, { params }).pipe(
      map(res => {
        if (res && res.items && res.items.length > 0) {
          if ((!categoryId || categoryId === 'all') && !searchTerm && pageNumber === 1) {
            this.syncStoredBooks(res.items);
          }
          return res;
        }
        return res || this.getStoredFilteredBooks(categoryId, searchTerm, pageNumber, pageSize);
      }),
      catchError(() => {
        return of(this.getStoredFilteredBooks(categoryId, searchTerm, pageNumber, pageSize));
      })
    );
  }

  getBooksAsProducts(categoryId?: string, searchTerm?: string): Observable<Product[]> {
    return this.getBooks(categoryId, searchTerm, 1, 100).pipe(
      map(res => (res.items || []).map(b => this.mapBookToProduct(b)))
    );
  }

  getBookById(id: string): Observable<Product> {
    const items = this.getStoredBooks();
    const localBook = items.find((b: any) => b.id === id);

    // If local mock id, return directly
    if (id && id.startsWith('book-') && localBook) {
      return of(this.mapBookToProduct(localBook));
    }

    return this.http.get<BookDto>(`${this.baseUrl}/${id}`).pipe(
      map(b => this.mapBookToProduct(b)),
      catchError(() => {
        if (localBook) {
          return of(this.mapBookToProduct(localBook));
        }
        return of(this.mapBookToProduct(items[0]));
      })
    );
  }

  private readonly DUMMY_BOOK_IDS = new Set(['book-1', 'book-2', 'book-3']);

  private syncStoredBooks(fetched: BookDto[]): void {
    try {
      const existing = this.getStoredBooks();
      const localOnly = existing.filter(b => b.id && b.id.startsWith('book-') && !this.DUMMY_BOOK_IDS.has(b.id));
      const fetchedIds = new Set(fetched.map(b => b.id));
      const merged = [
        ...localOnly.filter(b => !fetchedIds.has(b.id)),
        ...fetched
      ];
      localStorage.setItem(this.BOOKS_KEY, JSON.stringify(merged));
    } catch {}
  }

  private getStoredFilteredBooks(categoryId?: string, searchTerm?: string, pageNumber = 1, pageSize = 20): BookDtoPaginatedList {
    let items = this.getStoredBooks().filter(b => !this.DUMMY_BOOK_IDS.has(b.id));
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

    return {
      items: paginated,
      pageNumber,
      pageSize,
      totalCount: items.length,
      totalPages: Math.ceil(items.length / pageSize),
      hasPreviousPage: pageNumber > 1,
      hasNextPage: start + pageSize < items.length
    };
  }

  getStoredBooks(): BookDto[] {
    const raw = localStorage.getItem(this.BOOKS_KEY);
    if (raw) {
      try {
        let parsed = JSON.parse(raw) as BookDto[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed
            .filter(b => b && typeof b === 'object' && !this.DUMMY_BOOK_IDS.has(b.id))
            .map(b => ({
              ...b,
              titleAr: b.titleAr || b.titleEn || 'كتاب بدون عنوان',
              titleEn: b.titleEn || b.titleAr || 'Untitled Book',
              authorName: b.authorName || (b as any).authorAr || 'دار الوصل'
            }));
          if (filtered.length > 0) {
            return filtered;
          }
        }
      } catch {}
    }
    return [];
  }

  mapBookToProduct(book: BookDto): Product {
    if (!book) {
      return {
        id: 'corrupted',
        productType: 'Book',
        titleAr: 'كتاب غير متوفر / Unavailable Book',
        titleEn: 'Unavailable Book',
        price: 0,
        coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600',
        authorAr: 'Dar ElWasl',
        authorEn: 'Dar ElWasl',
        slug: 'corrupted',
        descriptionAr: '',
        descriptionEn: ''
      } as any;
    }
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
      titleAr: book.titleAr || book.titleEn || '',
      titleEn: book.titleEn || book.titleAr || '',
      price: isDiscounted ? book.discountPrice! : book.price,
      originalPrice: isDiscounted ? book.price : undefined,
      priceUsd,
      originalPriceUsd,
      coverImage: book.coverImageUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600',
      authorAr: book.authorName || (book as any).authorAr || '',
      authorEn: book.authorName || (book as any).authorEn || '',
      slug: book.id,
      category: book.categoryNameEn || book.categoryId,
      descriptionAr: book.descriptionAr || '',
      descriptionEn: book.descriptionEn || '',
      format: book.format || undefined,
      isbn: book.isbn,
      publishedDate: book.publishedDate,
      stock: book.stock
    };
  }
}
