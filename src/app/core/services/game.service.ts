import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { GameDto, GameDtoPaginatedList } from '../models/api.models';
import { Product } from '../../shared/components/product-card/product-card.component';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.baseUrl}/api/v1/Games`;
  private readonly GAMES_KEY = 'elwasl_admin_mock_games';

  getGames(searchTerm?: string, pageNumber = 1, pageSize = 20): Observable<GameDtoPaginatedList> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm && searchTerm.trim()) {
      params = params.set('searchTerm', searchTerm.trim());
    }

    return this.http.get<GameDtoPaginatedList>(this.baseUrl, { params }).pipe(
      map(res => {
        if (res && res.items && res.items.length > 0) {
          if (!searchTerm && pageNumber === 1) {
            this.syncStoredGames(res.items);
          }
          return res;
        }
        return res || this.getStoredFilteredGames(searchTerm, pageNumber, pageSize);
      }),
      catchError(() => of(this.getStoredFilteredGames(searchTerm, pageNumber, pageSize)))
    );
  }

  getGamesAsProducts(searchTerm?: string): Observable<Product[]> {
    return this.getGames(searchTerm, 1, 100).pipe(
      map(res => (res.items || []).map(g => this.mapGameToProduct(g)))
    );
  }

  getBookById(id: string): Observable<Product> {
    return this.getGameById(id);
  }

  getGameById(id: string): Observable<Product> {
    const items = this.getStoredGames();
    const game = items.find((g: any) => g.id === id);
    if (game) {
      return of(this.mapGameToProduct(game));
    }
    return this.http.get<GameDto>(`${this.baseUrl}/${id}`).pipe(
      map(g => this.mapGameToProduct(g)),
      catchError(() => {
        return of(this.mapGameToProduct(items[0]));
      })
    );
  }

  private readonly DUMMY_GAME_IDS = new Set(['game-1']);

  private syncStoredGames(fetched: GameDto[]): void {
    try {
      const existing = this.getStoredGames();
      const localOnly = existing.filter(g => g.id && String(g.id).startsWith('game-') && !this.DUMMY_GAME_IDS.has(g.id));
      const fetchedIds = new Set(fetched.map(g => g.id));
      const merged = [
        ...localOnly.filter(g => !fetchedIds.has(g.id)),
        ...fetched
      ];
      localStorage.setItem(this.GAMES_KEY, JSON.stringify(merged));
    } catch {}
  }

  private getStoredFilteredGames(searchTerm?: string, pageNumber = 1, pageSize = 20): GameDtoPaginatedList {
    let items = this.getStoredGames().filter(g => !this.DUMMY_GAME_IDS.has(g.id));
    items = items.filter((g: any) => g.isActive !== false);

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      items = items.filter((g: any) => 
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

  private getStoredGames(): GameDto[] {
    const raw = localStorage.getItem(this.GAMES_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as GameDto[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed
            .filter(g => g && typeof g === 'object' && !this.DUMMY_GAME_IDS.has(g.id))
            .map(g => ({
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

  private mapGameToProduct(game: GameDto): Product {
    return {
      id: game.id,
      productType: 'Game',
      titleAr: game.nameAr || '',
      titleEn: game.nameEn || '',
      price: game.price,
      priceUsd: game.priceUsd && game.priceUsd > 0 ? game.priceUsd : undefined,
      coverImage: game.imageUrl || 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&q=80&w=600',
      authorAr: game.categoryTag ? `تصنيف: ${game.categoryTag}` : `${game.playerCountMin}-${game.playerCountMax} لاعبين`,
      authorEn: game.categoryTag ? `Category: ${game.categoryTag}` : `${game.playerCountMin}-${game.playerCountMax} players`,
      slug: game.id,
      descriptionAr: game.descriptionAr || '',
      descriptionEn: game.descriptionEn || ''
    };
  }
}
