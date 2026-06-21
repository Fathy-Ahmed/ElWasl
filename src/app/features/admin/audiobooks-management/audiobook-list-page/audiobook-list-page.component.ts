import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AdminPageHeaderComponent } from '../../shared/components/admin-page-header/admin-page-header.component';
import { AdminDataTableComponent, TableColumn } from '../../shared/components/admin-data-table/admin-data-table.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminApiService } from '../../../../core/services/admin-api.service';

@Component({
  selector: 'app-audiobook-list-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, AdminPageHeaderComponent, AdminDataTableComponent],
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
          raw: a
        }));
        this.audiobooks.set(mapped);
      }
    });
  }

  addNewAudiobook(): void {
    this.snackBar.open('إضافة كتاب صوتي (سيتم دعم النموذج في النسخة القادمة) / Add form placeholder', 'إغلاق / Close', { duration: 3000 });
  }

  handleAction(event: { action: string; row: any }): void {
    if (event.action === 'edit') {
      this.snackBar.open(`تعديل كتاب صوتي: ${event.row.titleAr} / Edit action`, 'إغلاق / Close', { duration: 3000 });
    } else if (event.action === 'delete') {
      this.adminApiService.deleteAudiobook(event.row.id).subscribe({
        next: () => {
          this.audiobooks.update(current => current.filter(b => b.id !== event.row.id));
          this.snackBar.open(`تم حذف الكتاب الصوتي بنجاح / Audiobook deleted successfully`, 'إغلاق / Close', { duration: 3000 });
        }
      });
    }
  }
}
