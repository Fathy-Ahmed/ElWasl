import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AdminPageHeaderComponent } from '../../shared/components/admin-page-header/admin-page-header.component';
import { AdminDataTableComponent, TableColumn } from '../../shared/components/admin-data-table/admin-data-table.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AdminApiService } from '../../../../core/services/admin-api.service';
import { AudiobookDialogComponent } from '../audiobook-dialog/audiobook-dialog.component';

@Component({
  selector: 'app-audiobook-list-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, AdminPageHeaderComponent, AdminDataTableComponent, MatDialogModule],
  template: `
    <div class="management-page">
      <app-admin-page-header title="إدارة الكتب الصوتية / Audiobooks Management" 
                             subtitle="إضافة وتعديل ملفات الكتب الصوتية الرقمية ومراجعة المبيعات."
                             [breadcrumbs]="breadcrumbs"
                             actionLabel="إضافة كتاب صوتي / Add Audiobook"
                             actionIcon="add"
                             (actionClick)="addNewAudiobook()">
      </app-admin-page-header>

      <app-admin-data-table [columns]="tableColumns" 
                             [data]="audiobooks()" 
                             [actions]="tableActions"
                             (actionClick)="handleAction($event)">
      </app-admin-data-table>
    </div>
  `,
  styles: []
})
export class AudiobookListPageComponent implements OnInit {
  private readonly adminApiService = inject(AdminApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly breadcrumbs = [
    { label: 'الرئيسية / Admin', route: '/admin' },
    { label: 'الكتب الصوتية / Audiobooks' }
  ];

  readonly tableColumns: TableColumn[] = [
    { key: 'coverImage', label: 'الغلاف / Cover', type: 'image' },
    { key: 'titleAr', label: 'العنوان (عربي) / Title (AR)' },
    { key: 'titleEn', label: 'العنوان (إنجليزي) / Title (EN)' },
    { key: 'authorAr', label: 'المؤلف / Author' },
    { key: 'price', label: 'السعر / Price', type: 'currency' }
  ];

  readonly tableActions = [
    { name: 'edit', icon: 'edit', color: 'primary', idPrefix: 'edit-audio-' },
    { name: 'delete', icon: 'delete', color: 'warn', idPrefix: 'del-audio-' }
  ];

  readonly audiobooks = signal<any[]>([]);

  ngOnInit(): void {
    this.loadAudiobooks();
  }

  loadAudiobooks(): void {
    this.adminApiService.getAudiobooks().subscribe({
      next: (res) => {
        const mapped = (res.items || []).map(a => ({
          id: a.id,
          coverImage: a.coverImageUrl || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600',
          titleAr: a.titleAr || '',
          titleEn: a.titleEn || '',
          authorAr: a.narratorName || '',
          price: a.price,
          priceUsd: a.priceUsd,
          durationMinutes: a.durationMinutes,
          audioFileUrl: a.audioFileUrl,
          bookId: a.bookId,
          descriptionAr: a.descriptionAr,
          descriptionEn: a.descriptionEn,
          isActive: a.isActive,
          raw: a
        }));
        this.audiobooks.set(mapped);
      }
    });
  }

  addNewAudiobook(): void {
    const dialogRef = this.dialog.open(AudiobookDialogComponent, {
      width: '650px',
      data: {}
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.adminApiService.createAudiobook(result).subscribe({
          next: () => {
            this.loadAudiobooks();
            this.snackBar.open('تم إضافة الكتاب الصوتي بنجاح / Audiobook added successfully', 'إغلاق / Close', { duration: 3000 });
          }
        });
      }
    });
  }

  handleAction(event: { action: string; row: any }): void {
    if (event.action === 'edit') {
      const dialogRef = this.dialog.open(AudiobookDialogComponent, {
        width: '650px',
        data: { audiobook: event.row.raw || event.row }
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          const updateCommand = { id: event.row.id, ...result };
          this.adminApiService.updateAudiobook(event.row.id, updateCommand).subscribe({
            next: () => {
              this.loadAudiobooks();
              this.snackBar.open('تم تحديث الكتاب الصوتي بنجاح / Audiobook updated successfully', 'إغلاق / Close', { duration: 3000 });
            }
          });
        }
      });
    } else if (event.action === 'delete') {
      this.adminApiService.deleteAudiobook(event.row.id).subscribe({
        next: () => {
          this.audiobooks.update(current => current.filter(b => b.id !== event.row.id));
          this.snackBar.open('تم حذف الكتاب الصوتي بنجاح / Audiobook deleted successfully', 'إغلاق / Close', { duration: 3000 });
        }
      });
    }
  }
}
