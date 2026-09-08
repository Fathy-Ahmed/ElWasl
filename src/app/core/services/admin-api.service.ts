import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of, map } from 'rxjs';
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
      catchError(() => {
        return new Observable<string>(observer => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result === 'string') {
              observer.next(result);
              observer.complete();
            } else {
              observer.error(new Error('Failed to read file as base64'));
            }
          };
          reader.onerror = () => observer.error(reader.error);
          reader.readAsDataURL(file);
        });
      })
    );
  }

  private readonly BOOKS_KEY = 'elwasl_admin_mock_books';
  private readonly AUDIOBOOKS_KEY = 'elwasl_admin_mock_audiobooks';
  private readonly GAMES_KEY = 'elwasl_admin_mock_games';

  private readonly DUMMY_BOOK_IDS = new Set(['book-1', 'book-2', 'book-3']);
  private readonly DUMMY_AUDIO_IDS = new Set(['audiobook-1']);
  private readonly DUMMY_GAME_IDS = new Set(['game-1']);

  private getStoredMockBooks(): any[] {
    const raw = localStorage.getItem(this.BOOKS_KEY);
    if (raw) {
      try {
        let parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed
            .filter((b: any) => b && typeof b === 'object' && !this.DUMMY_BOOK_IDS.has(b.id))
            .map((b: any) => ({
              ...b,
              titleAr: b.titleAr || b.titleEn || 'كتاب بدون عنوان',
              titleEn: b.titleEn || b.titleAr || 'Untitled Book',
              authorName: b.authorName || b.authorAr || 'دار الوصل'
            }));
          if (filtered.length > 0) {
            return filtered;
          }
        }
      } catch {}
    }
    return [];
  }

  private syncStoredMockBooks(fetched: any[]): void {
    try {
      const existing = this.getStoredMockBooks();
      const localOnly = existing.filter((b: any) => b.id && String(b.id).startsWith('book-') && !this.DUMMY_BOOK_IDS.has(b.id));
      const fetchedIds = new Set(fetched.map((b: any) => b.id));
      const merged = [
        ...localOnly.filter((b: any) => !fetchedIds.has(b.id)),
        ...fetched
      ];
      localStorage.setItem(this.BOOKS_KEY, JSON.stringify(merged));
    } catch {}
  }

  private getStoredMockBooksPaginated(searchTerm?: string, pageNumber = 1, pageSize = 100): AdminBookDtoAdminPaginatedDto {
    let items = this.getStoredMockBooks().filter(b => !this.DUMMY_BOOK_IDS.has(b.id));
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

    return {
      items: paginated,
      pageNumber,
      pageSize,
      totalCount: items.length,
      totalPages: Math.ceil(items.length / pageSize)
    };
  }

  private getStoredMockAudiobooks(): any[] {
    const raw = localStorage.getItem(this.AUDIOBOOKS_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed
            .filter((a: any) => a && typeof a === 'object' && !this.DUMMY_AUDIO_IDS.has(a.id))
            .map((a: any) => ({
              ...a,
              titleAr: a.titleAr || a.titleEn || 'كتاب صوتي بدون عنوان',
              titleEn: a.titleEn || a.titleAr || 'Untitled Audiobook',
              narratorName: a.narratorName || 'دار الوصل'
            }));
          if (filtered.length > 0) {
            return filtered;
          }
        }
      } catch {}
    }
    return [];
  }

  private syncStoredMockAudiobooks(fetched: any[]): void {
    try {
      const existing = this.getStoredMockAudiobooks();
      const localOnly = existing.filter((a: any) => a.id && String(a.id).startsWith('audiobook-') && !this.DUMMY_AUDIO_IDS.has(a.id));
      const fetchedIds = new Set(fetched.map((a: any) => a.id));
      const merged = [
        ...localOnly.filter((a: any) => !fetchedIds.has(a.id)),
        ...fetched
      ];
      localStorage.setItem(this.AUDIOBOOKS_KEY, JSON.stringify(merged));
    } catch {}
  }

  private getStoredMockAudiobooksPaginated(searchTerm?: string, pageNumber = 1, pageSize = 20): AudiobookDtoPaginatedList {
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

  private getStoredMockGames(): any[] {
    const raw = localStorage.getItem(this.GAMES_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed
            .filter((g: any) => g && typeof g === 'object' && !this.DUMMY_GAME_IDS.has(g.id))
            .map((g: any) => ({
              ...g,
              nameAr: g.nameAr || g.nameEn || 'لعبة بدون اسم',
              nameEn: g.nameEn || g.nameAr || 'Untitled Game'
            }));
          if (filtered.length > 0) {
            return filtered;
          }
        }
      } catch {}
    }
    return [];
  }

  private syncStoredMockGames(fetched: any[]): void {
    try {
      const existing = this.getStoredMockGames();
      const localOnly = existing.filter((g: any) => g.id && String(g.id).startsWith('game-') && !this.DUMMY_GAME_IDS.has(g.id));
      const fetchedIds = new Set(fetched.map((g: any) => g.id));
      const merged = [
        ...localOnly.filter((g: any) => !fetchedIds.has(g.id)),
        ...fetched
      ];
      localStorage.setItem(this.GAMES_KEY, JSON.stringify(merged));
    } catch {}
  }

  private getStoredMockGamesPaginated(searchTerm?: string, pageNumber = 1, pageSize = 100): GameDtoPaginatedList {
    let items = this.getStoredMockGames().filter(g => !this.DUMMY_GAME_IDS.has(g.id));
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

  // === Admin Books ===
  getBooks(searchTerm?: string, pageNumber = 1, pageSize = 100): Observable<AdminBookDtoAdminPaginatedDto> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm && searchTerm.trim()) {
      params = params.set('searchTerm', searchTerm.trim());
    }

    return this.http.get<AdminBookDtoAdminPaginatedDto>(`${this.baseUrl}/books`, { params }).pipe(
      map(res => {
        if (res && res.items && res.items.length > 0) {
          if (!searchTerm && pageNumber === 1) {
            this.syncStoredMockBooks(res.items);
          }
          return res;
        }
        return res || this.getStoredMockBooksPaginated(searchTerm, pageNumber, pageSize);
      }),
      catchError(() => {
        // Fallback to public Books API
        return this.http.get<any>(`${API_CONFIG.baseUrl}/api/v1/Books`, { params }).pipe(
          map(publicRes => {
            if (publicRes && publicRes.items && publicRes.items.length > 0) {
              if (!searchTerm && pageNumber === 1) {
                this.syncStoredMockBooks(publicRes.items);
              }
              return {
                items: publicRes.items,
                pageNumber: publicRes.pageNumber || pageNumber,
                pageSize: publicRes.pageSize || pageSize,
                totalCount: publicRes.totalCount || publicRes.items.length,
                totalPages: publicRes.totalPages || Math.ceil((publicRes.totalCount || publicRes.items.length) / pageSize)
              } as AdminBookDtoAdminPaginatedDto;
            }
            return this.getStoredMockBooksPaginated(searchTerm, pageNumber, pageSize);
          }),
          catchError(() => of(this.getStoredMockBooksPaginated(searchTerm, pageNumber, pageSize)))
        );
      })
    );
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

    this.http.post<string>(`${this.baseUrl}/books`, command).pipe(
      catchError(() => this.http.post<string>(`${API_CONFIG.baseUrl}/api/v1/Books`, command))
    ).subscribe({ error: () => {} });

    return of(newId);
  }

  updateBook(id: string, command: UpdateBookCommand): Observable<void> {
    const books = this.getStoredMockBooks();
    const idx = books.findIndex(b => b.id === id);
    if (idx !== -1) {
      books[idx] = { ...books[idx], ...command };
      localStorage.setItem(this.BOOKS_KEY, JSON.stringify(books));
    }
    this.http.put<void>(`${this.baseUrl}/books/${id}`, command).pipe(
      catchError(() => this.http.put<void>(`${API_CONFIG.baseUrl}/api/v1/Books/${id}`, command))
    ).subscribe({ error: () => {} });
    return of(void 0);
  }

  deleteBook(id: string): Observable<void> {
    const books = this.getStoredMockBooks();
    const filtered = books.filter(b => b.id !== id);
    localStorage.setItem(this.BOOKS_KEY, JSON.stringify(filtered));
    this.http.delete<void>(`${this.baseUrl}/books/${id}`).pipe(
      catchError(() => this.http.delete<void>(`${API_CONFIG.baseUrl}/api/v1/Books/${id}`))
    ).subscribe({ error: () => {} });
    return of(void 0);
  }

  // === Admin Audiobooks ===
  getAudiobooks(searchTerm?: string, pageNumber = 1, pageSize = 100): Observable<AudiobookDtoPaginatedList> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm && searchTerm.trim()) {
      params = params.set('searchTerm', searchTerm.trim());
    }

    return this.http.get<AudiobookDtoPaginatedList>(`${this.baseUrl}/audiobooks`, { params }).pipe(
      map(res => {
        if (res && res.items && res.items.length > 0) {
          if (!searchTerm && pageNumber === 1) {
            this.syncStoredMockAudiobooks(res.items);
          }
          return res;
        }
        return res || this.getStoredMockAudiobooksPaginated(searchTerm, pageNumber, pageSize);
      }),
      catchError(() => {
        return this.http.get<AudiobookDtoPaginatedList>(`${API_CONFIG.baseUrl}/api/v1/Audiobooks`, { params }).pipe(
          map(publicRes => {
            if (publicRes && publicRes.items && publicRes.items.length > 0) {
              if (!searchTerm && pageNumber === 1) {
                this.syncStoredMockAudiobooks(publicRes.items);
              }
              return publicRes;
            }
            return this.getStoredMockAudiobooksPaginated(searchTerm, pageNumber, pageSize);
          }),
          catchError(() => of(this.getStoredMockAudiobooksPaginated(searchTerm, pageNumber, pageSize)))
        );
      })
    );
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

    this.http.post<string>(`${this.baseUrl}/audiobooks`, command).pipe(
      catchError(() => this.http.post<string>(`${API_CONFIG.baseUrl}/api/v1/Audiobooks`, command))
    ).subscribe({ error: () => {} });

    return of(newId);
  }

  updateAudiobook(id: string, command: UpdateAudiobookCommand): Observable<void> {
    const audiobooks = this.getStoredMockAudiobooks();
    const idx = audiobooks.findIndex(a => a.id === id);
    if (idx !== -1) {
      audiobooks[idx] = { ...audiobooks[idx], ...command };
      localStorage.setItem(this.AUDIOBOOKS_KEY, JSON.stringify(audiobooks));
    }
    this.http.put<void>(`${this.baseUrl}/audiobooks/${id}`, command).pipe(
      catchError(() => this.http.put<void>(`${API_CONFIG.baseUrl}/api/v1/Audiobooks/${id}`, command))
    ).subscribe({ error: () => {} });
    return of(void 0);
  }

  deleteAudiobook(id: string): Observable<void> {
    const audiobooks = this.getStoredMockAudiobooks();
    const filtered = audiobooks.filter(a => a.id !== id);
    localStorage.setItem(this.AUDIOBOOKS_KEY, JSON.stringify(filtered));
    this.http.delete<void>(`${this.baseUrl}/audiobooks/${id}`).pipe(
      catchError(() => this.http.delete<void>(`${API_CONFIG.baseUrl}/api/v1/Audiobooks/${id}`))
    ).subscribe({ error: () => {} });
    return of(void 0);
  }

  // === Admin Games ===
  getGames(searchTerm?: string, pageNumber = 1, pageSize = 100): Observable<GameDtoPaginatedList> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm && searchTerm.trim()) {
      params = params.set('searchTerm', searchTerm.trim());
    }

    return this.http.get<GameDtoPaginatedList>(`${this.baseUrl}/games`, { params }).pipe(
      map(res => {
        if (res && res.items && res.items.length > 0) {
          if (!searchTerm && pageNumber === 1) {
            this.syncStoredMockGames(res.items);
          }
          return res;
        }
        return res || this.getStoredMockGamesPaginated(searchTerm, pageNumber, pageSize);
      }),
      catchError(() => {
        return this.http.get<GameDtoPaginatedList>(`${API_CONFIG.baseUrl}/api/v1/Games`, { params }).pipe(
          map(publicRes => {
            if (publicRes && publicRes.items && publicRes.items.length > 0) {
              if (!searchTerm && pageNumber === 1) {
                this.syncStoredMockGames(publicRes.items);
              }
              return publicRes;
            }
            return this.getStoredMockGamesPaginated(searchTerm, pageNumber, pageSize);
          }),
          catchError(() => of(this.getStoredMockGamesPaginated(searchTerm, pageNumber, pageSize)))
        );
      })
    );
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

    this.http.post<string>(`${this.baseUrl}/games`, command).pipe(
      catchError(() => this.http.post<string>(`${API_CONFIG.baseUrl}/api/v1/Games`, command))
    ).subscribe({ error: () => {} });

    return of(newId);
  }

  updateGame(id: string, command: UpdateGameCommand): Observable<void> {
    const games = this.getStoredMockGames();
    const idx = games.findIndex(g => g.id === id);
    if (idx !== -1) {
      games[idx] = { ...games[idx], ...command };
      localStorage.setItem(this.GAMES_KEY, JSON.stringify(games));
    }
    this.http.put<void>(`${this.baseUrl}/games/${id}`, command).pipe(
      catchError(() => this.http.put<void>(`${API_CONFIG.baseUrl}/api/v1/Games/${id}`, command))
    ).subscribe({ error: () => {} });
    return of(void 0);
  }

  deleteGame(id: string): Observable<void> {
    const games = this.getStoredMockGames();
    const filtered = games.filter(g => g.id !== id);
    localStorage.setItem(this.GAMES_KEY, JSON.stringify(filtered));
    this.http.delete<void>(`${this.baseUrl}/games/${id}`).pipe(
      catchError(() => this.http.delete<void>(`${API_CONFIG.baseUrl}/api/v1/Games/${id}`))
    ).subscribe({ error: () => {} });
    return of(void 0);
  }

  // === Admin Categories ===
  private getLocalCategories(): CategoryDto[] {
    const raw = localStorage.getItem('elwasl_mock_categories');
    if (raw) {
      try { return JSON.parse(raw) as CategoryDto[]; } catch {}
    }
    return [
      { id: 'cat-1', nameAr: 'روايات وروايات مصورة', nameEn: 'Novels & Graphic Novels', slug: 'novels' },
      { id: 'cat-2', nameAr: 'كتب صوتية فاخرة', nameEn: 'Premium Audiobooks', slug: 'audiobooks' },
      { id: 'cat-3', nameAr: 'ألعاب ورقية ممتعة', nameEn: 'Card Games', slug: 'games' }
    ];
  }

  private saveLocalCategories(categories: CategoryDto[]): void {
    localStorage.setItem('elwasl_mock_categories', JSON.stringify(categories));
  }

  createCategory(command: CreateCategoryCommand): Observable<CategoryDto> {
    const newCategory: CategoryDto = {
      id: 'cat-' + Date.now().toString(),
      nameAr: command.nameAr,
      nameEn: command.nameEn,
      slug: command.slug || (command.nameEn ? command.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'cat-' + Date.now().toString())
    };

    const list = this.getLocalCategories();
    list.push(newCategory);
    this.saveLocalCategories(list);

    return this.http.post<CategoryDto>(this.categoryUrl, command).pipe(
      catchError(() => {
        return of(newCategory);
      }),
      map(res => {
        if (res && res.id && res.id !== newCategory.id) {
          const currentList = this.getLocalCategories();
          const idx = currentList.findIndex(c => c.id === newCategory.id);
          if (idx > -1) {
            currentList[idx] = res;
            this.saveLocalCategories(currentList);
          }
          return res;
        }
        return newCategory;
      })
    );
  }

  updateCategory(id: string, command: UpdateCategoryCommand): Observable<void> {
    const list = this.getLocalCategories();
    const idx = list.findIndex(c => c.id === id);
    if (idx > -1) {
      list[idx] = {
        ...list[idx],
        nameAr: command.nameAr,
        nameEn: command.nameEn,
        slug: command.slug || list[idx].slug
      };
      this.saveLocalCategories(list);
    }

    return this.http.put<void>(`${this.categoryUrl}/${id}`, command).pipe(
      catchError(() => {
        return of(void 0);
      })
    );
  }

  deleteCategory(id: string): Observable<void> {
    const list = this.getLocalCategories();
    const filtered = list.filter(c => c.id !== id);
    this.saveLocalCategories(filtered);

    return this.http.delete<void>(`${this.categoryUrl}/${id}`).pipe(
      catchError(() => {
        return of(void 0);
      })
    );
  }

  // === Admin Orders status persistence helpers ===
  private getStatusOverrides(): Record<string, OrderStatus> {
    try {
      const raw = localStorage.getItem('elwasl_order_status_overrides');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private saveStatusOverride(orderId: string, status: OrderStatus): void {
    const overrides = this.getStatusOverrides();
    overrides[orderId] = status;
    localStorage.setItem('elwasl_order_status_overrides', JSON.stringify(overrides));
  }

  // === Admin Orders ===
  getOrders(pageNumber = 1, pageSize = 20): Observable<AdminPaginatedOrderDto> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<AdminPaginatedOrderDto>(`${this.baseUrl}/orders`, { params }).pipe(
      map(res => {
        const stored = this.getStoredMockOrders();
        const serverItems = res && Array.isArray(res.items) ? res.items : [];

        // Deduplicate: identify server items by id and orderNumber
        const serverIds = new Set(serverItems.map(s => s.id));
        const serverNumbers = new Set(serverItems.map(s => s.orderNumber).filter(Boolean));

        // Keep local orders that are not on the server
        const localOnly = stored.filter(l => !serverIds.has(l.id) && (!l.orderNumber || !serverNumbers.has(l.orderNumber)));

        // Combine with newest local orders at top, followed by server items
        const combined = [...localOnly, ...serverItems];

        // Apply status overrides if present
        const overrides = this.getStatusOverrides();
        combined.forEach(o => {
          if (overrides[o.id] !== undefined) {
            o.status = overrides[o.id];
          } else if (o.orderNumber && overrides[o.orderNumber] !== undefined) {
            o.status = overrides[o.orderNumber];
          }
        });

        const start = (pageNumber - 1) * pageSize;
        const paged = combined.slice(start, start + pageSize);

        return {
          items: paged,
          pageNumber,
          pageSize,
          totalCount: combined.length,
          totalPages: Math.ceil(combined.length / pageSize) || 1
        } as AdminPaginatedOrderDto;
      }),
      catchError(() => {
        const stored = this.getStoredMockOrders();
        const overrides = this.getStatusOverrides();
        stored.forEach(o => {
          if (overrides[o.id] !== undefined) {
            o.status = overrides[o.id];
          } else if (o.orderNumber && overrides[o.orderNumber] !== undefined) {
            o.status = overrides[o.orderNumber];
          }
        });

        const start = (pageNumber - 1) * pageSize;
        const paged = stored.slice(start, start + pageSize);

        return of({
          items: paged,
          pageNumber,
          pageSize,
          totalCount: stored.length,
          totalPages: Math.ceil(stored.length / pageSize) || 1
        } as AdminPaginatedOrderDto);
      })
    );
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Observable<void> {
    this.saveStatusOverride(orderId, status);

    const orders = this.getStoredMockOrders();
    const found = orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (found) {
      found.status = status;
      this.saveStoredMockOrders(orders);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      try {
        const channel = new BroadcastChannel('elwasl_orders_channel');
        channel.postMessage({ type: 'ORDER_STATUS_UPDATED', orderId, status });
        channel.close();
      } catch {}
    }

    return this.http.put<void>(`${this.baseUrl}/orders/${orderId}/status`, { newStatus: status }).pipe(
      catchError(() => {
        return of(void 0);
      })
    );
  }

  refundOrder(orderId: string, reason: string): Observable<void> {
    this.saveStatusOverride(orderId, OrderStatus.Refunded);

    const orders = this.getStoredMockOrders();
    const found = orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (found) {
      found.status = OrderStatus.Refunded;
      this.saveStoredMockOrders(orders);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      try {
        const channel = new BroadcastChannel('elwasl_orders_channel');
        channel.postMessage({ type: 'ORDER_REFUNDED', orderId });
        channel.close();
      } catch {}
    }

    return this.http.post<void>(`${this.baseUrl}/orders/${orderId}/refund`, { refundReason: reason }).pipe(
      catchError(() => {
        return of(void 0);
      })
    );
  }
}
