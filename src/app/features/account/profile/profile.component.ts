import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService, User } from '../../../core/auth/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { CurrencyEgpPipe } from '../../../shared/pipes/currency-egp.pipe';

interface OrderItemDisplay {
  id: string;
  date: string;
  total: number;
  statusAr: string;
  statusEn: string;
  itemsCount: number;
}

interface LibraryItemDisplay {
  id: string;
  titleAr: string;
  titleEn: string;
  coverImage: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatButtonModule, MatIconModule, CurrencyEgpPipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly orderService = inject(OrderService);

  readonly user = signal<User | null>(null);
  readonly orders = signal<OrderItemDisplay[]>([]);
  readonly digitalLibrary = signal<LibraryItemDisplay[]>([]);
  readonly isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.user.set(this.authService.currentUser());
    this.loadUserData();
  }

  loadUserData(): void {
    this.isLoading.set(true);

    // Load user profile
    this.authService.fetchProfile().subscribe({
      next: (profile) => {
        const u: User = {
          id: profile.id,
          name: profile.fullName || profile.email || 'User',
          email: profile.email || '',
          role: profile.role || 'User'
        };
        this.user.set(u);
      }
    });

    // Load orders
    this.orderService.getOrders(1, 10).subscribe({
      next: (res) => {
        const mappedOrders = (res.items || []).map(o => {
          const count = o.orderItems ? o.orderItems.reduce((acc, item) => acc + item.quantity, 0) : 0;
          return {
            id: o.orderNumber || o.id.substring(0, 8),
            date: new Date(o.createdAt).toLocaleDateString(),
            total: o.totalAmount,
            statusAr: this.mapStatusAr(o.status || ''),
            statusEn: o.status || 'Pending',
            itemsCount: count
          };
        });
        this.orders.set(mappedOrders);
      }
    });

    // Load digital entitlements
    this.orderService.getEntitlements(1, 100).subscribe({
      next: (res) => {
        const mappedLibrary = (res.items || []).map(item => ({
          id: item.id,
          titleAr: item.titleAr || item.titleEn || '',
          titleEn: item.titleEn || '',
          coverImage: item.coverImageUrl || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600'
        }));
        this.digitalLibrary.set(mappedLibrary);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  private mapStatusAr(status: string): string {
    const s = status.toLowerCase();
    if (s.includes('paid') || s.includes('complete')) return 'مدفوع / مكتمل';
    if (s.includes('ship')) return 'تم الشحن';
    if (s.includes('cancel')) return 'ملغي';
    if (s.includes('refund')) return 'مسترجع';
    return 'قيد الانتظار';
  }
}
