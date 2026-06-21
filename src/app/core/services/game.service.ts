import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { GameDto, GameDtoPaginatedList } from '../models/api.models';
import { Product } from '../../shared/components/product-card/product-card.component';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.baseUrl}/api/v1/Games`;

  getGames(searchTerm?: string, pageNumber = 1, pageSize = 20): Observable<GameDtoPaginatedList> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }

    return this.http.get<GameDtoPaginatedList>(this.baseUrl, { params });
  }

  getGamesAsProducts(searchTerm?: string): Observable<Product[]> {
    return this.getGames(searchTerm, 1, 100).pipe(
      map(res => (res.items || []).map(g => this.mapGameToProduct(g)))
    );
  }

  getGameById(id: string): Observable<Product> {
    return this.http.get<GameDto>(`${this.baseUrl}/${id}`).pipe(
      map(g => this.mapGameToProduct(g))
    );
  }

  private mapGameToProduct(game: GameDto): Product {
    return {
      id: game.id,
      productType: 'Game',
      titleAr: game.nameAr || '',
      titleEn: game.nameEn || '',
      price: game.price,
      coverImage: game.imageUrl || 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&q=80&w=600',
      authorAr: game.categoryTag ? `تصنيف: ${game.categoryTag}` : `${game.playerCountMin}-${game.playerCountMax} لاعبين`,
      authorEn: game.categoryTag ? `Category: ${game.categoryTag}` : `${game.playerCountMin}-${game.playerCountMax} players`,
      slug: game.id, // Routing by ID
      descriptionAr: game.descriptionAr || '',
      descriptionEn: game.descriptionEn || ''
    };
  }
}
