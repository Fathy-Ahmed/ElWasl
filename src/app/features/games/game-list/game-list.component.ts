import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { Product, ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { GameService } from '../../../core/services/game.service';

@Component({
  selector: 'app-game-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    ProductCardComponent
  ],
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent implements OnInit {
  private readonly gameService = inject(GameService);

  readonly searchQuery = signal<string>('');
  readonly games = signal<Product[]>([]);
  readonly isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.isLoading.set(true);
    this.gameService.getGamesAsProducts(this.searchQuery()).subscribe({
      next: (data) => {
        this.games.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.loadGames();
  }
}
