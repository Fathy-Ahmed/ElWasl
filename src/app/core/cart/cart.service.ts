import { Injectable, computed, signal, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
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
  private readonly router = inject(Router);
  private activeUserId: string | null = null;

  // Signal-based cart state
  readonly items = signal<CartItem[]>([]);

  constructor() {
    // Read user ID directly from localStorage to initialize cart state immediately
    const storedUser = localStorage.getItem('user');
    let userId: string | null = null;
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        userId = user.id && user.id.trim() !== '' ? user.id : null;
      } catch {}
    }
    this.loadUserCart(userId);
  }

  // Computed state
  readonly totalItemsCount = computed(() => {
    return this.items().reduce((acc, item) => acc + item.quantity, 0);
  });

  readonly totalPrice = computed(() => {
    return this.items().reduce((acc, item) => acc + (item.price * item.quantity), 0);
  });

  addToCart(item: Omit<CartItem, 'quantity'>): boolean {
    if (!this.activeUserId) {
      const lang = this.localeService.currentLocale();
      let message = 'Please log in first to add products to your cart';
      let actionLabel = 'Login';
      
      if (lang === 'ar') {
        message = 'يرجى تسجيل الدخول أولاً لتتمكن من إضافة المنتجات إلى السلة';
        actionLabel = 'تسجيل الدخول';
      } else if (lang === 'fr') {
        message = 'Veuillez d\'abord vous connecter pour ajouter des produits au panier';
        actionLabel = 'Connexion';
      }

      this.snackBar.open(message, actionLabel, {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['warning-snackbar']
      }).onAction().subscribe(() => {
        this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      });
      return false;
    }

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

      // Notify user via dynamic localized snackbar
      const lang = this.localeService.currentLocale();
      const title = lang === 'ar' ? item.titleAr : ((item as any).titleFr || item.titleEn);
      
      let message = `"${title}" has been added to your cart`;
      let actionLabel = 'Close';
      
      if (lang === 'ar') {
        message = `تم إضافة "${title}" إلى عربة التسوق`;
        actionLabel = 'إغلاق';
      } else if (lang === 'fr') {
        message = `"${title}" a été ajouté au panier`;
        actionLabel = 'Fermer';
      }
      
      this.snackBar.open(message, actionLabel, {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      return updated;
    });

    return true;
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
    if (this.activeUserId) {
      localStorage.removeItem(`cart_items_${this.activeUserId}`);
    } else {
      sessionStorage.removeItem('cart_items_guest');
    }
    // Clean up legacy keys
    localStorage.removeItem('cart_items_guest');
    localStorage.removeItem('cart_items');
  }

  loadUserCart(userId: string | null): void {
    const sanitizedId = userId && userId.trim() !== '' ? userId : null;
    this.activeUserId = sanitizedId;
    
    if (sanitizedId) {
      // User cart is in localStorage
      const userKey = `cart_items_${sanitizedId}`;
      let userItems = this.getStoredItemsByKey(userKey, false);
      
      // Check if there are any guest items to merge from sessionStorage (or legacy localStorage keys)
      const guestItems = this.getStoredItemsByKey('cart_items_guest', true) // sessionStorage
        .concat(this.getStoredItemsByKey('cart_items_guest', false))       // legacy localStorage guest key
        .concat(this.getStoredItemsByKey('cart_items', false));             // legacy localStorage key
      
      if (guestItems.length > 0) {
        // Merge guest items into user items
        guestItems.forEach(guestItem => {
          const existing = userItems.find(i => i.productId === guestItem.productId && i.productType === guestItem.productType);
          if (existing) {
            existing.quantity += guestItem.quantity;
          } else {
            userItems.push(guestItem);
          }
        });
        
        // Save merged cart to localStorage
        this.saveItemsByKey(userKey, userItems, false);
        
        // Clear guest carts
        sessionStorage.removeItem('cart_items_guest');
        localStorage.removeItem('cart_items_guest');
        localStorage.removeItem('cart_items');
      }
      
      this.items.set(userItems);
    } else {
      // Guest cart is in sessionStorage
      let guestItems = this.getStoredItemsByKey('cart_items_guest', true);
      
      // Check if there are guest items in legacy keys in localStorage
      const legacyGuestItems = this.getStoredItemsByKey('cart_items_guest', false)
        .concat(this.getStoredItemsByKey('cart_items', false));
        
      if (guestItems.length === 0 && legacyGuestItems.length > 0) {
        guestItems = legacyGuestItems;
        // Migrate to sessionStorage
        this.saveItemsByKey('cart_items_guest', guestItems, true);
        localStorage.removeItem('cart_items_guest');
        localStorage.removeItem('cart_items');
      }
      
      this.items.set(guestItems);
    }
  }

  private getStoredItemsByKey(key: string, useSession = false): CartItem[] {
    const storage = useSession ? sessionStorage : localStorage;
    const stored = storage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored) as CartItem[];
      } catch {
        return [];
      }
    }
    return [];
  }

  private saveItemsByKey(key: string, items: CartItem[], useSession = false): void {
    const storage = useSession ? sessionStorage : localStorage;
    storage.setItem(key, JSON.stringify(items));
  }

  private saveItems(items: CartItem[]): void {
    if (this.activeUserId) {
      this.saveItemsByKey(`cart_items_${this.activeUserId}`, items, false);
    } else {
      this.saveItemsByKey('cart_items_guest', items, true);
    }
  }
}
