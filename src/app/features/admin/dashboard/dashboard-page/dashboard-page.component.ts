import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AdminPageHeaderComponent } from '../../shared/components/admin-page-header/admin-page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ChartCardWrapperComponent } from '../../shared/components/chart-card-wrapper/chart-card-wrapper.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { AdminApiService } from '../../../../core/services/admin-api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    AdminPageHeaderComponent,
    StatCardComponent,
    ChartCardWrapperComponent,
    StatusBadgeComponent
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent implements OnInit {
  private readonly adminApiService = inject(AdminApiService);

  // KPI Stats
  readonly stats = signal([
    { label: 'إجمالي المبيعات / Total Revenue', value: '0 ج.م', icon: 'payments', trend: 0, trendType: 'up' as const },
    { label: 'الطلبات الجديدة / Orders', value: '0 طلب', icon: 'shopping_basket', trend: 0, trendType: 'up' as const },
    { label: 'متوسط قيمة الطلب / Avg Order Value', value: '0 ج.م', icon: 'trending_up', trend: 0, trendType: 'up' as const },
    { label: 'إجمالي المنتجات / Total Products', value: '0 منتج', icon: 'inventory_2', trend: 0, trendType: 'up' as const }
  ]);

  // Low stock real-time data
  readonly lowStockItems = signal<any[]>([]);

  // Pending Actions
  readonly pendingRequests = signal([
    { id: 'cr1', title: 'طلب تعاقد رواية - أحمد صالح', type: 'Contract Request', date: '2026-06-20' },
    { id: 'cm1', title: 'شكوى تأخر توصيل - ياسمين طه', type: 'Contact Message', date: '2026-06-21' }
  ]);

  // Custom SVG sales chart data points
  readonly salesPoints = '10,210 50,180 90,195 130,120 170,140 210,80 250,95 290,40';
  readonly salesFillPoints = '10,210 50,180 90,195 130,120 170,140 210,80 250,95 290,40 290,240 10,240';

  readonly categoryBreakdown = [
    { name: 'روايات / Novels', percent: 55, color: '#1e3a8a', offset: 0 },
    { name: 'تاريخ / History', percent: 25, color: '#d97706', offset: 55 },
    { name: 'ألعاب ورق / Games', percent: 20, color: '#06b6d4', offset: 80 }
  ];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    forkJoin({
      orders: this.adminApiService.getOrders(1, 100),
      books: this.adminApiService.getBooks('', 1, 100),
      games: this.adminApiService.getGames('', 1, 100),
      audiobooks: this.adminApiService.getAudiobooks('', 1, 100)
    }).subscribe({
      next: (res) => {
        // Calculate Revenue and Orders count
        const ordersList = res.orders.items || [];
        const totalRevenue = ordersList.reduce((sum, o) => sum + o.totalAmount, 0);
        const ordersCount = ordersList.length;
        const avgOrderVal = ordersCount > 0 ? Math.round(totalRevenue / ordersCount) : 0;

        // Calculate total products
        const booksCount = res.books.totalCount || 0;
        const gamesCount = res.games.totalCount || 0;
        const audiobooksCount = res.audiobooks.totalCount || 0;
        const totalProducts = booksCount + gamesCount + audiobooksCount;

        // Update stats widgets
        this.stats.set([
          { label: 'إجمالي المبيعات / Total Revenue', value: `${totalRevenue.toLocaleString()} ج.م`, icon: 'payments', trend: 15.4, trendType: 'up' },
          { label: 'الطلبات الجديدة / Orders', value: `${ordersCount} طلب`, icon: 'shopping_basket', trend: 5.2, trendType: 'up' },
          { label: 'متوسط قيمة الطلب / Avg Order Value', value: `${avgOrderVal} ج.م`, icon: 'trending_up', trend: 2.1, trendType: 'up' },
          { label: 'إجمالي المنتجات / Total Products', value: `${totalProducts} منتج`, icon: 'inventory_2', trend: 10.0, trendType: 'up' }
        ]);

        // Aggregate low stock items
        const lowStock: any[] = [];
        (res.books.items || []).forEach(b => {
          if (b.stock <= 5) {
            lowStock.push({ id: b.id, titleAr: b.titleAr, titleEn: b.titleEn, type: 'Book', stock: b.stock });
          }
        });
        (res.games.items || []).forEach(g => {
          if (g.stock <= 5) {
            lowStock.push({ id: g.id, titleAr: g.nameAr, titleEn: g.nameEn, type: 'Game', stock: g.stock });
          }
        });
        this.lowStockItems.set(lowStock);
      }
    });
  }

  getDashOffset(percent: number, offset: number): number {
    const circumference = 2 * Math.PI * 40;
    const offsetFraction = offset / 100;
    return circumference * (1 - offsetFraction);
  }

  getDashArray(percent: number): string {
    const circumference = 2 * Math.PI * 40;
    const filled = (percent / 100) * circumference;
    const empty = circumference - filled;
    return `${filled} ${empty}`;
  }
}
