import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { Product, ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { BookService } from '../../../core/services/book.service';
import { CategoryService } from '../../../core/services/category.service';
import { CategoryDto } from '../../../core/models/api.models';
import { LocalizedTextPipe } from '../../../shared/pipes/localized-text.pipe';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatButtonToggleModule,
    ProductCardComponent,
    LocalizedTextPipe
  ],
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss']
})
export class BookListComponent implements OnInit {
  private readonly bookService = inject(BookService);
  private readonly categoryService = inject(CategoryService);

  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<string>('all');
  readonly books = signal<Product[]>([]);
  readonly categories = signal<CategoryDto[]>([]);
  readonly isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadCategories();
    this.loadBooks();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
      error: () => {}
    });
  }

  loadBooks(): void {
    this.isLoading.set(true);
    const categoryId = this.selectedCategory() === 'all' ? undefined : this.selectedCategory();
    this.bookService.getBooksAsProducts(categoryId, this.searchQuery()).subscribe({
      next: (data) => {
        this.books.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.loadBooks();
  }

  setCategory(category: string): void {
    this.selectedCategory.set(category);
    this.loadBooks();
  }
}
