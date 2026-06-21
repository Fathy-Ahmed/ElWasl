import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AdminPageHeaderComponent } from '../../shared/components/admin-page-header/admin-page-header.component';
import { AdminDataTableComponent, TableColumn } from '../../shared/components/admin-data-table/admin-data-table.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-category-list-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, AdminPageHeaderComponent, AdminDataTableComponent],
  template: `
    <div class="management-page">
      <app-admin-page-header title="إدارة التصنيفات والمجالات / Category Management" 
                             subtitle="إضافة وتعديل الأقسام الرئيسية للروايات والكتب."
                             [breadcrumbs]="breadcrumbs"
                             actionLabel="إضافة تصنيف جديد / Add Category"
                             actionIcon="add"
                             (actionClick)="addNewCategory()">
      </app-admin-page-header>

      <app-admin-data-table [columns]="tableColumns" 
                             [data]="categories()" 
                             [actions]="tableActions"
                             (actionClick)="handleAction($event)">
      </app-admin-data-table>
    </div>
  `,
  styles: []
})
export class CategoryListPageComponent {
  constructor(private snackBar: MatSnackBar) {}

  readonly breadcrumbs = [
    { label: 'الرئيسية / Admin', route: '/admin' },
    { label: 'التصنيفات / Categories' }
  ];

  readonly tableColumns: TableColumn[] = [
    { key: 'id', label: 'المعرف / ID' },
    { key: 'nameAr', label: 'التصنيف (عربي) / Name (AR)' },
    { key: 'nameEn', label: 'التصنيف (إنجليزي) / Name (EN)' },
    { key: 'slug', label: 'الرابط الفريد / Slug' }
  ];

  readonly tableActions = [
    { name: 'edit', icon: 'edit', color: 'primary', idPrefix: 'edit-cat-' },
    { name: 'delete', icon: 'delete', color: 'warn', idPrefix: 'del-cat-' }
  ];

  readonly categories = signal([
    { id: 'cat-1', nameAr: 'روايات / Novels', nameEn: 'Novels', slug: 'novel' },
    { id: 'cat-2', nameAr: 'تاريخ / History', nameEn: 'History', slug: 'history' },
    { id: 'cat-3', nameAr: 'رعب / Horror', nameEn: 'Horror', slug: 'horror' }
  ]);

  addNewCategory(): void {
    this.snackBar.open('إضافة تصنيف جديد (سيتم دعم النموذج في النسخة القادمة) / Add form placeholder', 'إغلاق / Close', { duration: 3000 });
  }

  handleAction(event: { action: string; row: any }): void {
    if (event.action === 'edit') {
      this.snackBar.open(`تعديل التصنيف: ${event.row.nameAr} / Edit action`, 'إغلاق / Close', { duration: 3000 });
    } else if (event.action === 'delete') {
      this.categories.update(current => current.filter(c => c.id !== event.row.id));
      this.snackBar.open(`تم حذف التصنيف بنجاح / Category deleted successfully`, 'إغلاق / Close', { duration: 3000 });
    }
  }
}
