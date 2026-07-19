import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

interface NavGroup {
  label: string;
  items: {
    label: string;
    route: string;
    icon: string;
    badgeSignal?: string; // Sourced key for dynamic count badge
  }[];
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, MatButtonModule, MatIconModule, MatBadgeModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss']
})
export class AdminSidebarComponent {
  // Pending badges mock counts
  readonly pendingOrdersCount = signal<number>(2);
  readonly pendingContractsCount = signal<number>(4);
  readonly pendingMessagesCount = signal<number>(3);

  readonly navGroups: NavGroup[] = [
    {
      label: 'الرئيسية / Home',
      items: [
        { label: 'لوحة التحكم / Dashboard', route: '/admin/dashboard', icon: 'dashboard' }
      ]
    },
    {
      label: 'كتالوج المنتجات / Catalog',
      items: [
        { label: 'الكتب المطبوعة / Books', route: '/admin/books', icon: 'book' },
        { label: 'الكتب الصوتية / Audiobooks', route: '/admin/audiobooks', icon: 'headset' },
        { label: 'ألعاب الورق / Games', route: '/admin/games', icon: 'casino' },
        { label: 'التصنيفات / Categories', route: '/admin/categories', icon: 'category' }
      ]
    },
    {
      label: 'العمليات الميدانية / Operations',
      items: [
        { label: 'الطلبات / Orders', route: '/admin/orders', icon: 'shopping_basket', badgeSignal: 'orders' },
        { label: 'المدفوعات / Payments', route: '/admin/payments', icon: 'receipt_long' }
      ]
    },
    {
      label: 'المستخدمين والطلبات / Users & CRM',
      items: [
        { label: 'الأعضاء / Users', route: '/admin/users', icon: 'people' },
        { label: 'طلبات التعاقد / Contracts', route: '/admin/contract-requests', icon: 'rate_review', badgeSignal: 'contracts' },
        { label: 'الرسائل الواردة / Messages', route: '/admin/contact-messages', icon: 'forum', badgeSignal: 'messages' }
      ]
    },
    {
      label: 'التسويق والمحتوى / Marketing',
      items: [
        { label: 'المعارض الجارية / Exhibitions', route: '/admin/exhibitions', icon: 'storefront' },
        { label: 'العروض الترويجية / Offers', route: '/admin/offers', icon: 'local_offer' },
        { label: 'أسعار العملات / Rates', route: '/admin/currency-settings', icon: 'currency_exchange' },
        { label: 'من نحن / About CMS', route: '/admin/content/about-us', icon: 'edit_note' },
        { label: 'شروط التعاقد / Terms CMS', route: '/admin/content/contract-terms', icon: 'gavel' },
        { label: 'تعديل الرئيسية / Homepage CMS', route: '/admin/content/homepage', icon: 'home_repair_service' }
      ]
    },
    {
      label: 'المراقبة والنظام / Security',
      items: [
        { label: 'سجلات الأحداث / Audit Logs', route: '/admin/audit-logs', icon: 'history_toggle_off' }
      ]
    }
  ];

  getBadgeValue(key?: string): number {
    if (key === 'orders') return this.pendingOrdersCount();
    if (key === 'contracts') return this.pendingContractsCount();
    if (key === 'messages') return this.pendingMessagesCount();
    return 0;
  }
}
