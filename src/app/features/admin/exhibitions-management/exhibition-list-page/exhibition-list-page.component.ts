import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AdminPageHeaderComponent } from '../../shared/components/admin-page-header/admin-page-header.component';
import { AdminDataTableComponent, TableColumn } from '../../shared/components/admin-data-table/admin-data-table.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ExhibitionService } from '../../../../core/services/exhibition.service';
import { ExhibitionDialogComponent } from '../exhibition-dialog/exhibition-dialog.component';
import { ExhibitionDto } from '../../../../core/models/api.models';

@Component({
  selector: 'app-exhibition-list-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, AdminPageHeaderComponent, AdminDataTableComponent, MatDialogModule],
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
export class ExhibitionListPageComponent implements OnInit {
  private readonly exhibitionService = inject(ExhibitionService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly breadcrumbs = [
    { label: 'الرئيسية / Admin', route: '/admin' },
    { label: 'المعارض / Exhibitions' }
  ];

  readonly tableColumns: TableColumn[] = [
    { key: 'image', label: 'الصورة / Image', type: 'image' },
    { key: 'titleAr', label: 'المعرض (عربي) / Title (AR)' },
    { key: 'titleEn', label: 'المعرض (إنجليزي) / Title (EN)' },
    { key: 'locationAr', label: 'الموقع / Location' },
    { key: 'dateAr', label: 'التاريخ / Date' },
    { key: 'status', label: 'حالة المعرض / Status', type: 'badge' }
  ];

  readonly tableActions = [
    { name: 'edit', icon: 'edit', color: 'primary', idPrefix: 'edit-ex-' },
    { name: 'delete', icon: 'delete', color: 'warn', idPrefix: 'del-ex-' }
  ];

  readonly exhibitions = signal<ExhibitionDto[]>([]);

  ngOnInit(): void {
    this.loadExhibitions();
  }

  loadExhibitions(): void {
    this.exhibitionService.getExhibitions().subscribe({
      next: (data) => {
        this.exhibitions.set(data);
      }
    });
  }

  addNewExhibition(): void {
    const dialogRef = this.dialog.open(ExhibitionDialogComponent, {
      width: '700px',
      data: {}
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.exhibitionService.createExhibition(result).subscribe({
          next: () => {
            this.loadExhibitions();
            this.snackBar.open('تم إضافة المعرض بنجاح / Exhibition added successfully', 'إغلاق / Close', { duration: 3000 });
          }
        });
      }
    });
  }

  handleAction(event: { action: string; row: any }): void {
    if (event.action === 'edit') {
      const dialogRef = this.dialog.open(ExhibitionDialogComponent, {
        width: '700px',
        data: { exhibition: event.row }
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.exhibitionService.updateExhibition(event.row.id, result).subscribe({
            next: () => {
              this.loadExhibitions();
              this.snackBar.open('تم تحديث المعرض بنجاح / Exhibition updated successfully', 'إغلاق / Close', { duration: 3000 });
            }
          });
        }
      });
    } else if (event.action === 'delete') {
      this.exhibitionService.deleteExhibition(event.row.id).subscribe({
        next: () => {
          this.loadExhibitions();
          this.snackBar.open(`تم حذف المعرض بنجاح / Exhibition deleted successfully`, 'إغلاق / Close', { duration: 3000 });
        }
      });
    }
  }
}
