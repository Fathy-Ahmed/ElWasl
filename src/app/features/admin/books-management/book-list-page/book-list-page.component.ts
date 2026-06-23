import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AdminPageHeaderComponent } from '../../shared/components/admin-page-header/admin-page-header.component';
import { AdminDataTableComponent, TableColumn } from '../../shared/components/admin-data-table/admin-data-table.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AdminApiService } from '../../../../core/services/admin-api.service';
import { BookDialogComponent } from '../book-dialog/book-dialog.component';

@Component({
  selector: 'app-book-list-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, AdminPageHeaderComponent, AdminDataTableComponent, MatDialogModule],
  template: `
    <div class="management-page">
      <app-admin-page-header title="إدارة الكتب المطبوعة / Printed Books Management" 
                             subtitle="قائمة جميع الكتب المتوفرة في المتجر، تعديل بياناتها، وحذفها."
                             [breadcrumbs]="breadcrumbs"
                             actionLabel="إضافة كتاب جديد / Add New Book"
                             actionIcon="add"
                             (actionClick)="addNewBook()">
      </app-admin-page-header>

      <app-admin-data-table [columns]="tableColumns" 
                             [data]="books()" 
                             [actions]="tableActions"
                             (actionClick)="handleAction($event)">
      </app-admin-data-table>
    </div>
  `,
  styles: []
})
export class BookListPageComponent implements OnInit {
  private readonly adminApiService = inject(AdminApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly breadcrumbs = [
    { label: 'الرئيسية / Admin', route: '/admin' },
    { label: 'الكتب / Books' }
  ];

  readonly tableColumns: TableColumn[] = [
    { key: 'coverImage', label: 'الغلاف / Cover', type: 'image' },
    { key: 'titleAr', label: 'العنوان (عربي) / Title (AR)' },
    { key: 'titleEn', label: 'العنوان (إنجليزي) / Title (EN)' },
    { key: 'authorAr', label: 'الكاتب / Author' },
    { key: 'price', label: 'السعر / Price', type: 'currency' },
    { key: 'stock', label: 'المخزون / Stock' }
  ];

  readonly tableActions = [
    { name: 'edit', icon: 'edit', color: 'primary', idPrefix: 'edit-book-' },
    { name: 'delete', icon: 'delete', color: 'warn', idPrefix: 'del-book-' }
  ];

  readonly books = signal<any[]>([]);

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.adminApiService.getBooks().subscribe({
      next: (res) => {
        const mapped = (res.items || []).map(b => ({
          id: b.id,
          coverImage: b.coverImageUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600',
          titleAr: b.titleAr || '',
          titleEn: b.titleEn || '',
          authorAr: b.authorName || '',
          price: b.price,
          stock: b.stock,
          categoryId: b.categoryId,
          format: b.format,
          language: b.language,
          publishedDate: b.publishedDate,
          descriptionAr: b.descriptionAr,
          descriptionEn: b.descriptionEn,
          isActive: b.isActive,
          raw: b
        }));
        this.books.set(mapped);
      }
    });
  }

  addNewBook(): void {
    const dialogRef = this.dialog.open(BookDialogComponent, {
      width: '650px',
      data: {}
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.adminApiService.createBook(result).subscribe({
          next: () => {
            this.loadBooks();
            this.snackBar.open('تم إضافة الكتاب بنجاح / Book added successfully', 'إغلاق / Close', { duration: 3000 });
          }
        });
      }
    });
  }

  handleAction(event: { action: string; row: any }): void {
    if (event.action === 'edit') {
      const dialogRef = this.dialog.open(BookDialogComponent, {
        width: '650px',
        data: { book: event.row.raw || event.row }
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          const updateCommand = { id: event.row.id, ...result };
          this.adminApiService.updateBook(event.row.id, updateCommand).subscribe({
            next: () => {
              this.loadBooks();
              this.snackBar.open('تم تحديث الكتاب بنجاح / Book updated successfully', 'إغلاق / Close', { duration: 3000 });
            }
          });
        }
      });
    } else if (event.action === 'delete') {
      this.adminApiService.deleteBook(event.row.id).subscribe({
        next: () => {
          this.books.update(current => current.filter(b => b.id !== event.row.id));
          this.snackBar.open('تم حذف الكتاب بنجاح / Book deleted successfully', 'إغلاق / Close', { duration: 3000 });
        }
      });
    }
  }
}
