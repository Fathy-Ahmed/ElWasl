import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  // === Admin Books ===
  getBooks(searchTerm?: string, pageNumber = 1, pageSize = 20): Observable<AdminBookDtoAdminPaginatedDto> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('isActive', 'true');
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    return this.http.get<AdminBookDtoAdminPaginatedDto>(`${this.baseUrl}/books`, { params });
  }

  createBook(command: CreateBookCommand): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/books`, command);
  }

  updateBook(id: string, command: UpdateBookCommand): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/books/${id}`, command);
  }

  deleteBook(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/books/${id}`);
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
    return this.http.get<AudiobookDtoPaginatedList>(`${this.baseUrl}/audiobooks`, { params });
  }

  createAudiobook(command: CreateAudiobookCommand): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/audiobooks`, command);
  }

  updateAudiobook(id: string, command: UpdateAudiobookCommand): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/audiobooks/${id}`, command);
  }

  deleteAudiobook(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/audiobooks/${id}`);
  }

  // === Admin Games ===
  getGames(searchTerm?: string, pageNumber = 1, pageSize = 20): Observable<GameDtoPaginatedList> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    return this.http.get<GameDtoPaginatedList>(`${this.baseUrl}/games`, { params });
  }

  createGame(command: CreateGameCommand): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/games`, command);
  }

  updateGame(id: string, command: UpdateGameCommand): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/games/${id}`, command);
  }

  deleteGame(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/games/${id}`);
  }

  // === Admin Categories ===
  createCategory(command: CreateCategoryCommand): Observable<CategoryDto> {
    return this.http.post<CategoryDto>(this.categoryUrl, command);
  }

  updateCategory(id: string, command: UpdateCategoryCommand): Observable<void> {
    return this.http.put<void>(`${this.categoryUrl}/${id}`, command);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.categoryUrl}/${id}`);
  }

  // === Admin Orders ===
  getOrders(pageNumber = 1, pageSize = 20): Observable<AdminPaginatedOrderDto> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<AdminPaginatedOrderDto>(`${this.baseUrl}/orders`, { params });
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/orders/${orderId}/status`, { newStatus: status });
  }

  refundOrder(orderId: string, reason: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/orders/${orderId}/refund`, { refundReason: reason });
  }
}
