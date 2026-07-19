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

  // === Admin Books ===
  getBooks(searchTerm?: string, pageNumber = 1, pageSize = 20): Observable<AdminBookDtoAdminPaginatedDto> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('isActive', 'true');
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    return this.http.get<AdminBookDtoAdminPaginatedDto>(`${this.baseUrl}/books`, { params }).pipe(
      catchError(() => of({
        items: [],
        pageNumber: 1,
        pageSize: 20,
        totalCount: 0,
        totalPages: 0
      }))
    );
  }

  createBook(command: CreateBookCommand): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/books`, command).pipe(
      catchError(() => of(Date.now().toString()))
    );
  }

  updateBook(id: string, command: UpdateBookCommand): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/books/${id}`, command).pipe(
      catchError(() => of(void 0))
    );
  }

  deleteBook(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/books/${id}`).pipe(
      catchError(() => of(void 0))
    );
  }

  // === Admin Audiobooks ===
  getAudiobooks(searchTerm?: string, pageNumber = 1, pageSize = 20): Observable<AudiobookDtoPaginatedList> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('isActive', 'true');
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    return this.http.get<AudiobookDtoPaginatedList>(`${this.baseUrl}/audiobooks`, { params }).pipe(
      catchError(() => of({
        items: [],
        pageNumber: 1,
        pageSize: 20,
        totalCount: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false
      }))
    );
  }

  createAudiobook(command: CreateAudiobookCommand): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/audiobooks`, command).pipe(
      catchError(() => of(Date.now().toString()))
    );
  }

  updateAudiobook(id: string, command: UpdateAudiobookCommand): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/audiobooks/${id}`, command).pipe(
      catchError(() => of(void 0))
    );
  }

  deleteAudiobook(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/audiobooks/${id}`).pipe(
      catchError(() => of(void 0))
    );
  }

  // === Admin Games ===
  getGames(searchTerm?: string, pageNumber = 1, pageSize = 20): Observable<GameDtoPaginatedList> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    return this.http.get<GameDtoPaginatedList>(`${this.baseUrl}/games`, { params }).pipe(
      catchError(() => of({
        items: [],
        pageNumber: 1,
        pageSize: 20,
        totalCount: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false
      }))
    );
  }

  createGame(command: CreateGameCommand): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/games`, command).pipe(
      catchError(() => of(Date.now().toString()))
    );
  }

  updateGame(id: string, command: UpdateGameCommand): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/games/${id}`, command).pipe(
      catchError(() => of(void 0))
    );
  }

  deleteGame(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/games/${id}`).pipe(
      catchError(() => of(void 0))
    );
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
