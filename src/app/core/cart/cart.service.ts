import { Injectable, computed, signal, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocaleService } from '../i18n/locale.service';

export interface CartItem {
  productId: string;
  productType: 'Book' | 'Audiobook' | 'Game';
  titleAr: string;
  titleEn: string;
  price: number;
  quantity: number;
  coverImage: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly localeService = inject(LocaleService);

  // Signal-based cart state
  readonly items = signal<CartItem[]>(this.getStoredItems());

  // Computed state
  readonly totalItemsCount = computed(() => {
    return this.items().reduce((acc, item) => acc + item.quantity, 0);
  });

  readonly totalPrice = computed(() => {
    return this.items().reduce((acc, item) => acc + (item.price * item.quantity), 0);
  });

  addToCart(item: Omit<CartItem, 'quantity'>): void {
    this.items.update(currentItems => {
      const existing = currentItems.find(i => i.productId === item.productId && i.productType === item.productType);
      let updated: CartItem[];
      
      if (existing) {
        updated = currentItems.map(i => 
          i.productId === item.productId && i.productType === item.productType
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        updated = [...currentItems, { ...item, quantity: 1 }];
      }

      this.saveItems(updated);

      // Notify user via dynamic bilingual snackbar
      const lang = this.localeService.currentLocale(); // 'ar' or 'en'
      const title = lang === 'ar' ? item.titleAr : item.titleEn;
      const message = lang === 'ar' 
        ? `تم إضافة "${title}" إلى عربة التسوق` 
        : `"${title}" has been added to your cart`;
      
      this.snackBar.open(message, lang === 'ar' ? 'إغلاق' : 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      return updated;
    });
  }

  updateQuantity(productId: string, productType: 'Book' | 'Audiobook' | 'Game', quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId, productType);
      return;
    }

    this.items.update(currentItems => {
      const updated = currentItems.map(i => 
        i.productId === productId && i.productType === productType
          ? { ...i, quantity }
          : i
      );
      this.saveItems(updated);
      return updated;
    });
  }

  removeItem(productId: string, productType: 'Book' | 'Audiobook' | 'Game'): void {
    this.items.update(currentItems => {
      const updated = currentItems.filter(i => !(i.productId === productId && i.productType === productType));
      this.saveItems(updated);
      return updated;
    });
  }

  clearCart(): void {
    this.items.set([]);
    localStorage.removeItem('cart_items');
  }

  private getStoredItems(): CartItem[] {
    const stored = localStorage.getItem('cart_items');
    if (stored) {
      try {
        return JSON.parse(stored) as CartItem[];
      } catch {
        return [];
      }
    }
    return [];
  }

  private saveItems(items: CartItem[]): void {
    localStorage.setItem('cart_items', JSON.stringify(items));
  }
}
