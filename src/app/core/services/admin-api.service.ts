import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { 
  AdminBookDtoAdminPaginatedDto, 
  AdminBookDto, 
  CreateBookCommand, 
  UpdateBookCommand,
  AudiobookDtoPaginatedList,
  AudiobookDto,
  CreateAudiobookCommand,
  UpdateAudiobookCommand,
  GameDtoPaginatedList,
  GameDto,
  CreateGameCommand,
  UpdateGameCommand,
  AdminPaginatedOrderDto,
  OrderStatus,
  CategoryDto,
  CreateCategoryCommand,
  UpdateCategoryCommand
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.baseUrl}/api/v1/admin`;
  private readonly categoryUrl = `${API_CONFIG.baseUrl}/api/v1/Categories`;

  private readonly ORDERS_KEY = 'elwasl_admin_mock_orders';

  private getStoredMockOrders(): any[] {
    const raw = localStorage.getItem(this.ORDERS_KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
    const initial = [
      {
        id: '3f8ce6c7-70d5-45b0-a9c6-5bd9ee83762b',
        orderNumber: 'ORD-20260621-5164',
        userEmail: 'hanatahaa3@gmail.com',
        customerName: 'Hana Taha',
        totalAmount: 80,
        status: OrderStatus.Pending,
        createdAt: '2026-06-22T10:00:00.000Z'
      },
      {
        id: '4g9df7d8-81e6-56c1-b0d7-6ce0ff94833c',
        orderNumber: 'ORD-20260620-1102',
        userEmail: 'ahmed.fathy@gmail.com',
        customerName: 'Ahmed Fathy',
        totalAmount: 350,
        status: OrderStatus.Shipped,
        createdAt: '2026-06-20T14:30:00.000Z'
      }
    ];
    localStorage.setItem(this.ORDERS_KEY, JSON.stringify(initial));
    return initial;
  }

  private saveStoredMockOrders(orders: any[]): void {
    localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
  }

  // === Admin File Upload ===
  uploadFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<string>(`${this.baseUrl}/files/upload`, formData).pipe(
      catchError(() => of(URL.createObjectURL(file)))
    );
  }

  private readonly BOOKS_KEY = 'elwasl_admin_mock_books';
  private readonly AUDIOBOOKS_KEY = 'elwasl_admin_mock_audiobooks';
  private readonly GAMES_KEY = 'elwasl_admin_mock_games';

  private getStoredMockBooks(): any[] {
    const raw = localStorage.getItem(this.BOOKS_KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
    const initial = [
      {
        id: 'book-1',
        titleAr: 'حساب وهمي',
        titleEn: 'fack account',
        authorName: 'يوسف حسن يوسف',
        isbn: '9789770154823',
        coverImageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600',
        categoryId: 'cat-1',
        price: 250,
        discountPrice: null,
        priceUsd: 5.0,
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

  private getStoredMockAudiobooks(): any[] {
    const raw = localStorage.getItem(this.AUDIOBOOKS_KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
    const initial = [
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

  private getStoredMockGames(): any[] {
    const raw = localStorage.getItem(this.GAMES_KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
    const initial = [
      {
        id: 'game-1',
        nameAr: 'لعبة سبع ورقات',
        nameEn: 'Seven Cards Game',
        imageUrl: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&q=80&w=600',
        price: 200,
        priceUsd: 4.0,
        playerCountMin: 2,
        playerCountMax: 6,
        categoryTag: 'Card Games',
        descriptionAr: 'لعبة الكروت العائلية المصرية الشهيرة.',
        descriptionEn: 'The famous Egyptian family card game.',
        isActive: true
      }
    ];
    localStorage.setItem(this.GAMES_KEY, JSON.stringify(initial));
    return initial;
  }

  // === Admin Books ===
  getBooks(searchTerm?: string, pageNumber = 1, pageSize = 20): Observable<AdminBookDtoAdminPaginatedDto> {
    let items = this.getStoredMockBooks();
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      items = items.filter(b => 
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
    } as AdminBookDtoAdminPaginatedDto);
  }

  createBook(command: CreateBookCommand): Observable<string> {
    const books = this.getStoredMockBooks();
    const newId = `book-${Date.now()}`;
    const newBook = {
      id: newId,
      ...command,
      isActive: true
    };
    books.unshift(newBook); // Prepend to show up first in dashboard
    localStorage.setItem(this.BOOKS_KEY, JSON.stringify(books));

    this.http.post<string>(`${this.baseUrl}/books`, command).subscribe({ error: () => {} });
    return of(newId);
  }

  updateBook(id: string, command: UpdateBookCommand): Observable<void> {
    const books = this.getStoredMockBooks();
    const idx = books.findIndex(b => b.id === id);
    if (idx !== -1) {
      books[idx] = { ...books[idx], ...command };
      localStorage.setItem(this.BOOKS_KEY, JSON.stringify(books));
    }
    this.http.put<void>(`${this.baseUrl}/books/${id}`, command).subscribe({ error: () => {} });
    return of(void 0);
  }

  deleteBook(id: string): Observable<void> {
    const books = this.getStoredMockBooks();
    const filtered = books.filter(b => b.id !== id);
    localStorage.setItem(this.BOOKS_KEY, JSON.stringify(filtered));
    this.http.delete<void>(`${this.baseUrl}/books/${id}`).subscribe({ error: () => {} });
    return of(void 0);
  }

  // === Admin Audiobooks ===
  getAudiobooks(searchTerm?: string, pageNumber = 1, pageSize = 20): Observable<AudiobookDtoPaginatedList> {
    let items = this.getStoredMockAudiobooks();
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      items = items.filter(a => 
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

  createAudiobook(command: CreateAudiobookCommand): Observable<string> {
    const audiobooks = this.getStoredMockAudiobooks();
    const newId = `audiobook-${Date.now()}`;
    const newAudio = {
      id: newId,
      ...command,
      isActive: true
    };
    audiobooks.unshift(newAudio);
    localStorage.setItem(this.AUDIOBOOKS_KEY, JSON.stringify(audiobooks));

    this.http.post<string>(`${this.baseUrl}/audiobooks`, command).subscribe({ error: () => {} });
    return of(newId);
  }

  updateAudiobook(id: string, command: UpdateAudiobookCommand): Observable<void> {
    const audiobooks = this.getStoredMockAudiobooks();
    const idx = audiobooks.findIndex(a => a.id === id);
    if (idx !== -1) {
      audiobooks[idx] = { ...audiobooks[idx], ...command };
      localStorage.setItem(this.AUDIOBOOKS_KEY, JSON.stringify(audiobooks));
    }
    this.http.put<void>(`${this.baseUrl}/audiobooks/${id}`, command).subscribe({ error: () => {} });
    return of(void 0);
  }

  deleteAudiobook(id: string): Observable<void> {
    const audiobooks = this.getStoredMockAudiobooks();
    const filtered = audiobooks.filter(a => a.id !== id);
    localStorage.setItem(this.AUDIOBOOKS_KEY, JSON.stringify(filtered));
    this.http.delete<void>(`${this.baseUrl}/audiobooks/${id}`).subscribe({ error: () => {} });
    return of(void 0);
  }

  // === Admin Games ===
  getGames(searchTerm?: string, pageNumber = 1, pageSize = 20): Observable<GameDtoPaginatedList> {
    let items = this.getStoredMockGames();
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      items = items.filter(g => 
        (g.nameAr && g.nameAr.toLowerCase().includes(s)) ||
        (g.nameEn && g.nameEn.toLowerCase().includes(s)) ||
        (g.categoryTag && g.categoryTag.toLowerCase().includes(s))
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
    } as GameDtoPaginatedList);
  }

  createGame(command: CreateGameCommand): Observable<string> {
    const games = this.getStoredMockGames();
    const newId = `game-${Date.now()}`;
    const newGame = {
      id: newId,
      ...command,
      isActive: true
    };
    games.unshift(newGame);
    localStorage.setItem(this.GAMES_KEY, JSON.stringify(games));

    this.http.post<string>(`${this.baseUrl}/games`, command).subscribe({ error: () => {} });
    return of(newId);
  }

  updateGame(id: string, command: UpdateGameCommand): Observable<void> {
    const games = this.getStoredMockGames();
    const idx = games.findIndex(g => g.id === id);
    if (idx !== -1) {
      games[idx] = { ...games[idx], ...command };
      localStorage.setItem(this.GAMES_KEY, JSON.stringify(games));
    }
    this.http.put<void>(`${this.baseUrl}/games/${id}`, command).subscribe({ error: () => {} });
    return of(void 0);
  }

  deleteGame(id: string): Observable<void> {
    const games = this.getStoredMockGames();
    const filtered = games.filter(g => g.id !== id);
    localStorage.setItem(this.GAMES_KEY, JSON.stringify(filtered));
    this.http.delete<void>(`${this.baseUrl}/games/${id}`).subscribe({ error: () => {} });
    return of(void 0);
  }

  // === Admin Categories ===
  createCategory(command: CreateCategoryCommand): Observable<CategoryDto> {
    return this.http.post<CategoryDto>(this.categoryUrl, command).pipe(
      catchError(() => of({ id: Date.now().toString(), nameAr: command.nameAr, nameEn: command.nameEn }))
    );
  }

  updateCategory(id: string, command: UpdateCategoryCommand): Observable<void> {
    return this.http.put<void>(`${this.categoryUrl}/${id}`, command).pipe(
      catchError(() => of(void 0))
    );
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.categoryUrl}/${id}`).pipe(
      catchError(() => of(void 0))
    );
  }

  // === Admin Orders ===
  getOrders(pageNumber = 1, pageSize = 20): Observable<AdminPaginatedOrderDto> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<AdminPaginatedOrderDto>(`${this.baseUrl}/orders`, { params }).pipe(
      catchError(() => {
        const stored = this.getStoredMockOrders();
        return of({
          items: stored,
          pageNumber,
          pageSize,
          totalCount: stored.length,
          totalPages: Math.ceil(stored.length / pageSize)
        } as AdminPaginatedOrderDto);
      })
    );
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/orders/${orderId}/status`, { newStatus: status }).pipe(
      catchError(() => {
        const orders = this.getStoredMockOrders();
        const found = orders.find(o => o.id === orderId || o.orderNumber === orderId);
        if (found) {
          found.status = status;
          this.saveStoredMockOrders(orders);
        }
        return of(void 0);
      })
    );
  }

  refundOrder(orderId: string, reason: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/orders/${orderId}/refund`, { refundReason: reason }).pipe(
      catchError(() => {
        const orders = this.getStoredMockOrders();
        const found = orders.find(o => o.id === orderId);
        if (found) {
          found.status = OrderStatus.Refunded;
          this.saveStoredMockOrders(orders);
        }
        return of(void 0);
      })
    );
  }
}
