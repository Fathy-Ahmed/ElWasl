import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    let items = this.getStoredBooks();
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
  }

  getBooksAsProducts(categoryId?: string, searchTerm?: string): Observable<Product[]> {
    return this.getBooks(categoryId, searchTerm, 1, 100).pipe(
      map(res => (res.items || []).map(b => this.mapBookToProduct(b)))
    );
  }

  getBookById(id: string): Observable<Product> {
    const items = this.getStoredBooks();
    const book = items.find((b: any) => b.id === id);
    if (book) {
      return of(this.mapBookToProduct(book));
    }
    return this.http.get<BookDto>(`${this.baseUrl}/${id}`).pipe(
      map(b => this.mapBookToProduct(b)),
      catchError(() => {
        // Fallback to first book as safety
        return of(this.mapBookToProduct(items[0]));
      })
    );
  }

  private getStoredBooks(): BookDto[] {
    const raw = localStorage.getItem(this.BOOKS_KEY);
    if (raw) {
      try {
        let parsed = JSON.parse(raw) as BookDto[];
        if (Array.isArray(parsed)) {
          parsed = parsed.filter(b => b !== null && b !== undefined && typeof b === 'object');
          if (parsed.length > 0) {
            const isCorrupted = parsed.some(b => !b || !b.titleAr || !b.titleEn || !b.authorName);
            if (!isCorrupted) {
              return parsed;
            }
          }
        }
      } catch {}
    }
    const initial: BookDto[] = [
      {
        id: 'book-1',
        titleAr: 'حساب وهمي',
        titleEn: 'Fake Account',
        authorName: 'يوسف حسن يوسف',
        isbn: '9789770154823',
        coverImageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
        categoryId: 'cat-1',
        price: 80,
        discountPrice: null,
        priceUsd: 1.6,
        discountPriceUsd: null,
        stock: 0,
        format: 'Paperback',
        language: 'Arabic',
        publishedDate: '2026-06-01',
        descriptionAr: 'رواية مشوقة حول الحسابات الوهمية على منصات التواصل الاجتماعي.',
        descriptionEn: 'An exciting novel about fake accounts on social media platforms.',
        isActive: true
      },
      {
        id: 'book-2',
        titleAr: 'اسرار مثلث برمودة',
        titleEn: 'The Blue Elephant',
        authorName: 'Ahmed Mourad',
        isbn: '9789770154824',
        coverImageUrl: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=600',
        categoryId: 'cat-1',
        price: 120,
        discountPrice: null,
        priceUsd: 2.4,
        discountPriceUsd: null,
        stock: 50,
        format: 'Paperback',
        language: 'Arabic',
        publishedDate: '2014-10-12',
        descriptionAr: 'رواية تأخذك إلى عوالم الغموض والإثارة.',
        descriptionEn: 'A novel that takes you to worlds of mystery and excitement.',
        isActive: true
      },
      {
        id: 'book-3',
        titleAr: 'ملف الظل',
        titleEn: 'The Power of Habit',
        authorName: 'Charles Duhigg',
        isbn: '9789770154825',
        coverImageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600',
        categoryId: 'cat-1',
        price: 250,
        discountPrice: null,
        priceUsd: 5.0,
        discountPriceUsd: null,
        stock: 30,
        format: 'Paperback',
        language: 'English',
        publishedDate: '2012-02-28',
        descriptionAr: 'لماذا نفعل ما نفعل في الحياة والعمل.',
        descriptionEn: 'Why we do what we do in life and business.',
        isActive: true
      }
    ];
    localStorage.setItem(this.BOOKS_KEY, JSON.stringify(initial));
    return initial;
  }

  private mapBookToProduct(book: BookDto): Product {
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
      titleAr: book.titleAr || '',
      titleEn: book.titleEn || '',
      price: isDiscounted ? book.discountPrice! : book.price,
      originalPrice: isDiscounted ? book.price : undefined,
      priceUsd,
      originalPriceUsd,
      coverImage: book.coverImageUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600',
      authorAr: book.authorName || '',
      authorEn: book.authorName || '',
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
