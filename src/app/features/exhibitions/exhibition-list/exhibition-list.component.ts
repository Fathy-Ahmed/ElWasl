import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject, HostListener } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LocalizedTextPipe } from '../../../shared/pipes/localized-text.pipe';
import { ImageUrlPipe } from '../../../shared/pipes/image-url.pipe';
import { ExhibitionService } from '../../../core/services/exhibition.service';
import { ExhibitionDto } from '../../../core/models/api.models';

@Component({
  selector: 'app-exhibition-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, MatButtonModule, MatIconModule, LocalizedTextPipe, ImageUrlPipe],
  templateUrl: './exhibition-list.component.html',
  styleUrls: ['./exhibition-list.component.scss']
})
export class ExhibitionListComponent implements OnInit {
  private readonly exhibitionService = inject(ExhibitionService);

  readonly exhibitions = signal<ExhibitionDto[]>([]);
  readonly isLoading = signal<boolean>(false);

  @HostListener('window:storage', ['$event'])
  onStorageChange(event: StorageEvent): void {
    if (event.key === 'elwasl_exhibitions') {
      this.loadExhibitions();
    }
  }

  ngOnInit(): void {
    this.loadExhibitions();
  }

  loadExhibitions(): void {
    this.isLoading.set(true);
    this.exhibitionService.getExhibitions().subscribe({
      next: (data) => {
        this.exhibitions.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
