import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { Product, ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { AudiobookService } from '../../../core/services/audiobook.service';

@Component({
  selector: 'app-audiobook-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    ProductCardComponent
  ],
  templateUrl: './audiobook-list.component.html',
  styleUrls: ['./audiobook-list.component.scss']
})
export class AudiobookListComponent implements OnInit {
  private readonly audiobookService = inject(AudiobookService);

  readonly searchQuery = signal<string>('');
  readonly audiobooks = signal<Product[]>([]);
  readonly isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadAudiobooks();
  }

  loadAudiobooks(): void {
    this.isLoading.set(true);
    this.audiobookService.getAudiobooksAsProducts(this.searchQuery()).subscribe({
      next: (data) => {
        this.audiobooks.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.loadAudiobooks();
  }
}
