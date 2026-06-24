import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AdminPageHeaderComponent } from '../../shared/components/admin-page-header/admin-page-header.component';
import { AdminDataTableComponent, TableColumn } from '../../shared/components/admin-data-table/admin-data-table.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CategoryService } from '../../../../core/services/category.service';
import { AdminApiService } from '../../../../core/services/admin-api.service';
import { CategoryDialogComponent } from '../category-dialog/category-dialog.component';
import { CategoryDto } from '../../../../core/models/api.models';

@Component({
  selector: 'app-category-list-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, AdminPageHeaderComponent, AdminDataTableComponent, MatDialogModule],
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
export class CategoryListPageComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly adminApiService = inject(AdminApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

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

  readonly categories = signal<CategoryDto[]>([]);

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories.set(res || []);
      }
    });
  }

  addNewCategory(): void {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '600px',
      data: { categories: this.categories() }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.adminApiService.createCategory(result).subscribe({
          next: () => {
            this.loadCategories();
            this.snackBar.open('تم إضافة التصنيف بنجاح / Category added successfully', 'إغلاق / Close', { duration: 3000 });
          }
        });
      }
    });
  }

  handleAction(event: { action: string; row: any }): void {
    if (event.action === 'edit') {
      const dialogRef = this.dialog.open(CategoryDialogComponent, {
        width: '600px',
        data: { category: event.row, categories: this.categories() }
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          const updateCommand = { id: event.row.id, ...result };
          this.adminApiService.updateCategory(event.row.id, updateCommand).subscribe({
            next: () => {
              this.loadCategories();
              this.snackBar.open('تم تحديث التصنيف بنجاح / Category updated successfully', 'إغلاق / Close', { duration: 3000 });
            }
          });
        }
      });
    } else if (event.action === 'delete') {
      this.adminApiService.deleteCategory(event.row.id).subscribe({
        next: () => {
          this.categories.update(current => current.filter(c => c.id !== event.row.id));
          this.snackBar.open('تم حذف التصنيف بنجاح / Category deleted successfully', 'إغلاق / Close', { duration: 3000 });
        }
      });
    }
  }
}
