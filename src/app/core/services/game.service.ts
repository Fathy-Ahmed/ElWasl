import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    let items = this.getStoredGames();
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

  getGamesAsProducts(searchTerm?: string): Observable<Product[]> {
    return this.getGames(searchTerm, 1, 100).pipe(
      map(res => (res.items || []).map(g => this.mapGameToProduct(g)))
    );
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

  private getStoredGames(): GameDto[] {
    const raw = localStorage.getItem(this.GAMES_KEY);
    if (raw) {
      try { return JSON.parse(raw) as GameDto[]; } catch {}
    }
    const initial: any[] = [
      {
        id: 'game-1',
        nameAr: 'لعبة ترتيب الكلمات',
        nameEn: 'Word Builder',
        price: 220,
        priceUsd: 4.4,
        imageUrl: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&q=80&w=600',
        categoryId: 'cat-3',
        playerCountMin: 2,
        playerCountMax: 6,
        categoryTag: 'ألعاب تفكير',
        publishedDate: '2026-06-15',
        descriptionAr: 'لعبة ورقية مبتكرة لبناء الكلمات العربية وزيادة الحصيلة اللغوية.',
        descriptionEn: 'An innovative card game to build Arabic words and increase vocabulary.',
        isActive: true
      }
    ];
    localStorage.setItem(this.GAMES_KEY, JSON.stringify(initial));
    return initial;
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
