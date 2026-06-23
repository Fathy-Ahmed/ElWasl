import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AdminPageHeaderComponent } from '../../shared/components/admin-page-header/admin-page-header.component';
import { AdminDataTableComponent, TableColumn } from '../../shared/components/admin-data-table/admin-data-table.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AdminApiService } from '../../../../core/services/admin-api.service';
import { GameDialogComponent } from '../game-dialog/game-dialog.component';

@Component({
  selector: 'app-game-list-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, AdminPageHeaderComponent, AdminDataTableComponent, MatDialogModule],
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
  private readonly dialog = inject(MatDialog);

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
          categoryTag: g.categoryTag,
          playerCountMin: g.playerCountMin,
          playerCountMax: g.playerCountMax,
          descriptionAr: g.descriptionAr,
          descriptionEn: g.descriptionEn,
          isActive: g.isActive,
          raw: g
        }));
        this.games.set(mapped);
      }
    });
  }

  addNewGame(): void {
    const dialogRef = this.dialog.open(GameDialogComponent, {
      width: '650px',
      data: {}
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.adminApiService.createGame(result).subscribe({
          next: () => {
            this.loadGames();
            this.snackBar.open('تم إضافة اللعبة بنجاح / Card game added successfully', 'إغلاق / Close', { duration: 3000 });
          }
        });
      }
    });
  }

  handleAction(event: { action: string; row: any }): void {
    if (event.action === 'edit') {
      const dialogRef = this.dialog.open(GameDialogComponent, {
        width: '650px',
        data: { game: event.row.raw || event.row }
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          const updateCommand = { id: event.row.id, ...result };
          this.adminApiService.updateGame(event.row.id, updateCommand).subscribe({
            next: () => {
              this.loadGames();
              this.snackBar.open('تم تحديث اللعبة بنجاح / Card game updated successfully', 'إغلاق / Close', { duration: 3000 });
            }
          });
        }
      });
    } else if (event.action === 'delete') {
      this.adminApiService.deleteGame(event.row.id).subscribe({
        next: () => {
          this.games.update(current => current.filter(g => g.id !== event.row.id));
          this.snackBar.open('تم حذف اللعبة بنجاح / Card game deleted successfully', 'إغلاق / Close', { duration: 3000 });
        }
      });
    }
  }
}
