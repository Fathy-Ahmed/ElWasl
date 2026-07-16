import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { BookService } from '../../../core/services/book.service';
import { AudiobookService } from '../../../core/services/audiobook.service';
import { GameService } from '../../../core/services/game.service';
import { Product } from '../../../shared/components/product-card/product-card.component';
import { LocalizedTextPipe } from '../../../shared/pipes/localized-text.pipe';
import { CurrencyEgpPipe } from '../../../shared/pipes/currency-egp.pipe';
import { AudioPlayerDialogComponent } from './audio-player-dialog.component';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    LocalizedTextPipe,
    CurrencyEgpPipe
  ],
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly orderService = inject(OrderService);
  private readonly bookService = inject(BookService);
  private readonly audiobookService = inject(AudiobookService);
  private readonly gameService = inject(GameService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  readonly purchasedItems = signal<Product[]>([]);
  readonly filteredItems = signal<Product[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly activeFilter = signal<'all' | 'books' | 'audiobooks' | 'games'>('all');
  readonly searchQuery = signal<string>('');

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.loadLibrary();
    }
  }

  loadLibrary(): void {
    this.isLoading.set(true);

    // Fetch user orders, entitlements, and catalog products to map them
    forkJoin({
      orders: this.orderService.getOrders(1, 100).pipe(catchError(() => of({ items: [] }))),
      entitlements: this.orderService.getEntitlements(1, 100).pipe(catchError(() => of({ items: [] }))),
      books: this.bookService.getBooksAsProducts().pipe(catchError(() => of([]))),
      audiobooks: this.audiobookService.getAudiobooksAsProducts().pipe(catchError(() => of([]))),
      games: this.gameService.getGamesAsProducts().pipe(catchError(() => of([])))
    }).subscribe({
      next: (res) => {
        const purchasedProductIds = new Set<string>();

        // 1. Extract IDs from completed / paid orders
        if (res.orders && res.orders.items) {
          res.orders.items.forEach(order => {
            const status = (order.status || '').toLowerCase();
            // Count as purchased if status is completed, paid, shipped, or delivered
            if (status.includes('paid') || status.includes('complete') || status.includes('ship') || status.includes('deliver')) {
              if (order.orderItems) {
                order.orderItems.forEach(item => {
                  purchasedProductIds.add(item.productId);
                });
              }
            }
          });
        }

        // 2. Extract IDs from digital library entitlements
        if (res.entitlements && res.entitlements.items) {
          res.entitlements.items.forEach(ent => {
            purchasedProductIds.add(ent.productId);
          });
        }

        // 3. Collect matching products from our catalogs
        const allProducts = [...res.books, ...res.audiobooks, ...res.games];
        const matched = allProducts.filter(prod => purchasedProductIds.has(prod.id));

        // 4. Update states
        this.purchasedItems.set(matched);
        this.applyFilterAndSearch();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading library items', err);
        this.isLoading.set(false);
        this.snackBar.open('فشل تحميل المكتبة / Failed to load library', 'إغلاق / Close', { duration: 3000 });
      }
    });
  }

  setFilter(filter: 'all' | 'books' | 'audiobooks' | 'games'): void {
    this.activeFilter.set(filter);
    this.applyFilterAndSearch();
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery.set(query);
    this.applyFilterAndSearch();
  }

  applyFilterAndSearch(): void {
    let items = this.purchasedItems();
    const filter = this.activeFilter();
    const query = this.searchQuery().toLowerCase().trim();

    // Apply category filter
    if (filter === 'books') {
      items = items.filter(item => item.productType === 'Book');
    } else if (filter === 'audiobooks') {
      items = items.filter(item => item.productType === 'Audiobook');
    } else if (filter === 'games') {
      items = items.filter(item => item.productType === 'Game');
    }

    // Apply search query
    if (query) {
      items = items.filter(item => 
        item.titleAr.toLowerCase().includes(query) || 
        item.titleEn.toLowerCase().includes(query) || 
        (item.authorAr && item.authorAr.toLowerCase().includes(query)) ||
        (item.authorEn && item.authorEn.toLowerCase().includes(query))
      );
    }

    this.filteredItems.set(items);
  }

  getProductTypeLabel(type: string): string {
    if (type === 'Book') return 'كتاب مطبوع / Print Book';
    if (type === 'Audiobook') return 'كتاب صوتي / Audiobook';
    if (type === 'Game') return 'لعبة ورق / Card Game';
    return type;
  }

  getProductTypeClass(type: string): string {
    if (type === 'Book') return 'badge-book';
    if (type === 'Audiobook') return 'badge-audiobook';
    if (type === 'Game') return 'badge-game';
    return '';
  }

  getDetailRoute(item: Product): string {
    if (item.productType === 'Book') return `/books/${item.slug}`;
    if (item.productType === 'Audiobook') return `/audiobooks/${item.slug}`;
    if (item.productType === 'Game') return `/games/${item.slug}`;
    return '/';
  }

  listenToAudiobook(item: Product, event: MouseEvent): void {
    event.stopPropagation();
    this.dialog.open(AudioPlayerDialogComponent, {
      data: item,
      width: '450px',
      maxWidth: '90vw',
      panelClass: 'custom-player-dialog'
    });
  }
}
