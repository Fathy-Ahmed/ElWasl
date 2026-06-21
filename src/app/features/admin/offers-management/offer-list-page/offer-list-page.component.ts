import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AdminPageHeaderComponent } from '../../shared/components/admin-page-header/admin-page-header.component';
import { AdminDataTableComponent, TableColumn } from '../../shared/components/admin-data-table/admin-data-table.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-offer-list-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, AdminPageHeaderComponent, AdminDataTableComponent],
  template: `
    <div class="management-page">
      <app-admin-page-header title="إدارة العروض الترويجية / Offers Management" 
                             subtitle="إضافة خصومات جديدة وربطها مع الكتب والألعاب."
                             [breadcrumbs]="breadcrumbs"
                             actionLabel="إضافة عرض جديد / Add Offer"
                             actionIcon="add"
                             (actionClick)="addNewOffer()">
      </app-admin-page-header>

      <app-admin-data-table [columns]="tableColumns" 
                             [data]="offers()" 
                             [actions]="tableActions"
                             (actionClick)="handleAction($event)">
      </app-admin-data-table>
    </div>
  `,
  styles: []
})
export class OfferListPageComponent {
  constructor(private snackBar: MatSnackBar) {}

  readonly breadcrumbs = [
    { label: 'الرئيسية / Admin', route: '/admin' },
    { label: 'العروض / Offers' }
  ];

  readonly tableColumns: TableColumn[] = [
    { key: 'titleAr', label: 'العرض (عربي) / Title (AR)' },
    { key: 'titleEn', label: 'العرض (إنجليزي) / Title (EN)' },
    { key: 'offerType', label: 'نوع العرض / Type' },
    { key: 'discount', label: 'الخصم / Discount' },
    { key: 'status', label: 'الحالة / Status', type: 'badge' }
  ];

  readonly tableActions = [
    { name: 'edit', icon: 'edit', color: 'primary', idPrefix: 'edit-offer-' },
    { name: 'delete', icon: 'delete', color: 'warn', idPrefix: 'del-offer-' }
  ];

  readonly offers = signal([
    { id: 'o1', titleAr: 'عروض الصيف الحارة', titleEn: 'Sizzling Summer Offers', offerType: 'summer', discount: '50%', status: 'active' },
    { id: 'o2', titleAr: 'خصم الشتاء المتميز', titleEn: 'Winter Premium Discount', offerType: 'winter', discount: '30%', status: 'inactive' }
  ]);

  addNewOffer(): void {
    this.snackBar.open('إضافة عرض جديد (سيتم دعم النموذج في النسخة القادمة) / Add form placeholder', 'إغلاق / Close', { duration: 3000 });
  }

  handleAction(event: { action: string; row: any }): void {
    if (event.action === 'edit') {
      this.snackBar.open(`تعديل العرض: ${event.row.titleAr} / Edit action`, 'إغلاق / Close', { duration: 3000 });
    } else if (event.action === 'delete') {
      this.offers.update(current => current.filter(o => o.id !== event.row.id));
      this.snackBar.open(`تم حذف العرض بنجاح / Offer deleted successfully`, 'إغلاق / Close', { duration: 3000 });
    }
  }
}
