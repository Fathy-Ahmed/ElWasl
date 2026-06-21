import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AdminPageHeaderComponent } from '../../shared/components/admin-page-header/admin-page-header.component';
import { AdminDataTableComponent, TableColumn } from '../../shared/components/admin-data-table/admin-data-table.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminApiService } from '../../../../core/services/admin-api.service';

@Component({
  selector: 'app-game-list-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, AdminPageHeaderComponent, AdminDataTableComponent],
  template: `
    <div class="management-page">
      <app-admin-page-header title="إدارة ألعاب الورق / Card Games Management" 
                             subtitle="إدارة ألعاب التحدي والورق المتوفرة بالمستودعات."
                             [breadcrumbs]="breadcrumbs"
                             actionLabel="إضافة لعبة جديدة / Add Card Game"
                             actionIcon="add"
                             (actionClick)="addNewGame()">
      </app-admin-page-header>

      <app-admin-data-table [columns]="tableColumns" 
                             [data]="games()" 
                             [actions]="tableActions"
                             (actionClick)="handleAction($event)">
      </app-admin-data-table>
    </div>
  `,
  styles: []
})
export class GameListPageComponent implements OnInit {
  private readonly adminApiService = inject(AdminApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly breadcrumbs = [
    { label: 'الرئيسية / Admin', route: '/admin' },
    { label: 'ألعاب الورق / Games' }
  ];

  readonly tableColumns: TableColumn[] = [
    { key: 'coverImage', label: 'صورة اللعبة / Cover', type: 'image' },
    { key: 'titleAr', label: 'اسم اللعبة (عربي) / Title (AR)' },
    { key: 'titleEn', label: 'اسم اللعبة (إنجليزي) / Title (EN)' },
    { key: 'price', label: 'السعر / Price', type: 'currency' },
    { key: 'stock', label: 'المخزون / Stock' }
  ];

  readonly tableActions = [
    { name: 'edit', icon: 'edit', color: 'primary', idPrefix: 'edit-game-' },
    { name: 'delete', icon: 'delete', color: 'warn', idPrefix: 'del-game-' }
  ];

  readonly games = signal<any[]>([]);

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.adminApiService.getGames().subscribe({
      next: (res) => {
        const mapped = (res.items || []).map(g => ({
          id: g.id,
          coverImage: g.imageUrl || 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&q=80&w=600',
          titleAr: g.nameAr || '',
          titleEn: g.nameEn || '',
          price: g.price,
          stock: g.stock,
          raw: g
        }));
        this.games.set(mapped);
      }
    });
  }

  addNewGame(): void {
    this.snackBar.open('إضافة لعبة جديدة (سيتم دعم النموذج في النسخة القادمة) / Add form placeholder', 'إغلاق / Close', { duration: 3000 });
  }

  handleAction(event: { action: string; row: any }): void {
    if (event.action === 'edit') {
      this.snackBar.open(`تعديل لعبة: ${event.row.titleAr} / Edit action`, 'إغلاق / Close', { duration: 3000 });
    } else if (event.action === 'delete') {
      this.adminApiService.deleteGame(event.row.id).subscribe({
        next: () => {
          this.games.update(current => current.filter(g => g.id !== event.row.id));
          this.snackBar.open(`تم حذف اللعبة بنجاح / Card game deleted successfully`, 'إغلاق / Close', { duration: 3000 });
        }
      });
    }
  }
}
