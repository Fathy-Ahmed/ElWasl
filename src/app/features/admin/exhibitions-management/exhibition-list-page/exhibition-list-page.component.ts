import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AdminPageHeaderComponent } from '../../shared/components/admin-page-header/admin-page-header.component';
import { AdminDataTableComponent, TableColumn } from '../../shared/components/admin-data-table/admin-data-table.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-exhibition-list-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, AdminPageHeaderComponent, AdminDataTableComponent],
  template: `
    <div class="management-page">
      <app-admin-page-header title="إدارة معارض الكتاب / Exhibitions Management" 
                             subtitle="إضافة وتعديل بيانات المعارض الجارية والمستقبلية."
                             [breadcrumbs]="breadcrumbs"
                             actionLabel="إضافة معرض جديد / Add Exhibition"
                             actionIcon="add"
                             (actionClick)="addNewExhibition()">
      </app-admin-page-header>

      <app-admin-data-table [columns]="tableColumns" 
                             [data]="exhibitions()" 
                             [actions]="tableActions"
                             (actionClick)="handleAction($event)">
      </app-admin-data-table>
    </div>
  `,
  styles: []
})
export class ExhibitionListPageComponent {
  constructor(private snackBar: MatSnackBar) {}

  readonly breadcrumbs = [
    { label: 'الرئيسية / Admin', route: '/admin' },
    { label: 'المعارض / Exhibitions' }
  ];

  readonly tableColumns: TableColumn[] = [
    { key: 'titleAr', label: 'المعرض (عربي) / Title (AR)' },
    { key: 'titleEn', label: 'المعرض (إنجليزي) / Title (EN)' },
    { key: 'locationAr', label: 'الموقع / Location' },
    { key: 'status', label: 'حالة المعرض / Status', type: 'badge' }
  ];

  readonly tableActions = [
    { name: 'edit', icon: 'edit', color: 'primary', idPrefix: 'edit-ex-' },
    { name: 'delete', icon: 'delete', color: 'warn', idPrefix: 'del-ex-' }
  ];

  readonly exhibitions = signal([
    {
      id: 'ex1',
      titleAr: 'معرض القاهرة الدولي للكتاب ٢٠٢٦',
      titleEn: 'Cairo International Book Fair 2026',
      locationAr: 'مركز مصر للمعارض الدولية',
      locationEn: 'Egypt International Exhibition Center',
      status: 'active'
    },
    {
      id: 'ex2',
      titleAr: 'معرض الشارقة الدولي للكتاب ٢٠٢٦',
      titleEn: 'Sharjah International Book Fair 2026',
      locationAr: 'إكسبو الشارقة',
      locationEn: 'Expo Centre Sharjah',
      status: 'upcoming'
    }
  ]);

  addNewExhibition(): void {
    this.snackBar.open('إضافة معرض جديد (سيتم دعم النموذج في النسخة القادمة) / Add form placeholder', 'إغلاق / Close', { duration: 3000 });
  }

  handleAction(event: { action: string; row: any }): void {
    if (event.action === 'edit') {
      this.snackBar.open(`تعديل المعرض: ${event.row.titleAr} / Edit action`, 'إغلاق / Close', { duration: 3000 });
    } else if (event.action === 'delete') {
      this.exhibitions.update(current => current.filter(e => e.id !== event.row.id));
      this.snackBar.open(`تم حذف المعرض بنجاح / Exhibition deleted successfully`, 'إغلاق / Close', { duration: 3000 });
    }
  }
}
