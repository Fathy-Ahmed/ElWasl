import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { CategoryService } from '../../../../core/services/category.service';
import { AdminApiService } from '../../../../core/services/admin-api.service';
import { ImageUrlPipe } from '../../../../shared/pipes/image-url.pipe';
import { CategoryDto, BookFormat, Language } from '../../../../core/models/api.models';

@Component({
  selector: 'app-book-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    ImageUrlPipe
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.book ? 'تعديل كتاب / Edit Book' : 'إضافة كتاب جديد / Add Book' }}
    </h2>
    
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content class="mat-typography dialog-content">
        <!-- Row 1: Titles -->
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>العنوان بالعربية / Title (AR)</mat-label>
            <input matInput formControlName="titleAr" required>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>العنوان بالإنجليزية / Title (EN)</mat-label>
            <input matInput formControlName="titleEn" required>
          </mat-form-field>
        </div>

        <!-- Row 2: Author & ISBN -->
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>الكاتب / Author Name</mat-label>
            <input matInput formControlName="authorName" required>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>ISBN</mat-label>
            <input matInput formControlName="isbn">
          </mat-form-field>
        </div>

        <!-- Row 3: Cover & Category -->
        <div class="form-row image-upload-row">
          <div class="image-upload-container">
            <mat-form-field appearance="outline">
              <mat-label>رابط صورة الغلاف / Cover Image URL</mat-label>
              <input matInput formControlName="coverImageUrl">
            </mat-form-field>
            <button type="button" mat-stroked-button color="primary" class="upload-btn" [disabled]="isUploading()" (click)="fileInput.click()">
              <mat-icon>cloud_upload</mat-icon>
              {{ isUploading() ? 'جاري الرفع...' : 'رفع صورة / Upload' }}
            </button>
            <input type="file" #fileInput style="display: none;" accept="image/*" (change)="onImageUploaded($event)">
          </div>

          <mat-form-field appearance="outline">
            <mat-label>التصنيف / Category</mat-label>
            <mat-select formControlName="categoryId" required>
              @for (cat of categories; track cat.id) {
                <mat-option [value]="cat.id">
                  {{ cat.nameAr }} / {{ cat.nameEn }}
                </mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <!-- Image Preview Block -->
        @if (localPreviewUrl() || form.get('coverImageUrl')?.value) {
          <div class="image-preview-container">
            <span class="preview-label">معاينة الغلاف / Cover Preview:</span>
            <div class="image-preview">
              <img [src]="localPreviewUrl() || (form.get('coverImageUrl')?.value | imageUrl)" alt="Preview" class="preview-img">
              <button type="button" mat-icon-button color="warn" class="remove-img-btn" (click)="removeImage()">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
        }

        <!-- Row 4: Pricing & Stock -->
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>السعر / Price</mat-label>
            <input type="number" matInput formControlName="price" required min="0">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>سعر الخصم / Discount Price</mat-label>
            <input type="number" matInput formControlName="discountPrice" min="0">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>المخزون / Stock</mat-label>
            <input type="number" matInput formControlName="stock" required min="0">
          </mat-form-field>
        </div>

        <!-- Row 5: Formats, Languages, Publish Date -->
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>تنسيق الكتاب / Format</mat-label>
            <mat-select formControlName="format" required>
              <mat-option [value]="1">غلاف ورقي سميك / Hardcover</mat-option>
              <mat-option [value]="2">غلاف ورقي عادي / Paperback</mat-option>
              <mat-option [value]="3">كتاب إلكتروني / EBook</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>اللغة / Language</mat-label>
            <mat-select formControlName="language" required>
              <mat-option [value]="1">العربية / Arabic</mat-option>
              <mat-option [value]="2">الإنجليزية / English</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>تاريخ النشر / Published Date</mat-label>
            <input type="date" matInput formControlName="publishedDate">
          </mat-form-field>
        </div>

        <!-- Textareas for Descriptions -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>الوصف بالعربية / Description (AR)</mat-label>
          <textarea matInput formControlName="descriptionAr" rows="3"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>الوصف بالإنجليزية / Description (EN)</mat-label>
          <textarea matInput formControlName="descriptionEn" rows="3"></textarea>
        </mat-form-field>

        <!-- Status Checkbox for Edit Mode -->
        @if (data.book) {
          <div class="checkbox-row">
            <mat-checkbox formControlName="isActive">نشط في المتجر / Active in Store</mat-checkbox>
          </div>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button type="button" mat-button mat-dialog-close>إلغاء / Cancel</button>
        <button type="submit" mat-raised-button color="primary" [disabled]="form.invalid || isUploading()">حفظ / Save</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-width: 600px;
      max-height: 70vh;
      padding-top: 10px;
    }
    .form-row {
      display: flex;
      gap: 16px;
    }
    .form-row mat-form-field {
      flex: 1;
    }
    .image-upload-row {
      align-items: flex-start;
    }
    .image-upload-container {
      display: flex;
      gap: 8px;
      flex: 1;
    }
    .image-upload-container mat-form-field {
      flex: 1;
    }
    .upload-btn {
      height: 52px;
      margin-top: 4px;
    }
    .image-preview-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 8px;
    }
    .preview-label {
      font-size: 0.85rem;
      color: #666;
    }
    .image-preview {
      position: relative;
      display: inline-block;
      max-width: 120px;
      border: 1px dashed #ccc;
      border-radius: 4px;
      overflow: hidden;
    }
    .preview-img {
      width: 100%;
      height: auto;
      display: block;
    }
    .remove-img-btn {
      position: absolute;
      top: 4px;
      right: 4px;
      background-color: rgba(255, 255, 255, 0.9) !important;
      width: 32px;
      height: 32px;
      line-height: 32px;
    }
    .w-full {
      width: 100%;
    }
    .checkbox-row {
      margin-top: 10px;
      margin-bottom: 10px;
    }
  `]
})
export class BookDialogComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly adminApiService = inject(AdminApiService);
  
  form!: FormGroup;
  categories: CategoryDto[] = [];
  readonly isUploading = signal<boolean>(false);
  readonly localPreviewUrl = signal<string>('');

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<BookDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { book?: any }
  ) {}

  ngOnInit(): void {
    // Load categories for the dropdown selection
    this.categoryService.getCategories().subscribe(res => {
      this.categories = res || [];
    });

    const b = this.data.book;
    
    // Format publishedDate to YYYY-MM-DD for the HTML5 date input
    let formattedDate = '';
    if (b?.publishedDate) {
      formattedDate = b.publishedDate.split('T')[0];
    }

    // Determine default formats & languages (ensure they map to enum numeric values)
    const formatValue = b?.format !== undefined ? this.mapFormatToNumber(b.format) : 2; // Paperback default
    const langValue = b?.language !== undefined ? this.mapLanguageToNumber(b.language) : 1; // Arabic default

    this.form = this.fb.group({
      titleAr: [b?.titleAr || '', Validators.required],
      titleEn: [b?.titleEn || '', Validators.required],
      authorName: [b?.authorName || '', Validators.required],
      isbn: [b?.isbn || ''],
      coverImageUrl: [b?.coverImageUrl || ''],
      categoryId: [b?.categoryId || '', Validators.required],
      price: [b?.price || 0, [Validators.required, Validators.min(0)]],
      discountPrice: [b?.discountPrice || null, Validators.min(0)],
      stock: [b?.stock || 0, [Validators.required, Validators.min(0)]],
      format: [formatValue, Validators.required],
      language: [langValue, Validators.required],
      publishedDate: [formattedDate],
      descriptionAr: [b?.descriptionAr || ''],
      descriptionEn: [b?.descriptionEn || ''],
      isActive: [b?.isActive !== undefined ? b.isActive : true]
    });
  }

  mapFormatToNumber(fmt: any): number {
    if (typeof fmt === 'number') return fmt;
    if (fmt === 'Hardcover') return 1;
    if (fmt === 'Paperback') return 2;
    if (fmt === 'EBook') return 3;
    return 2;
  }

  mapLanguageToNumber(lang: any): number {
    if (typeof lang === 'number') return lang;
    if (lang === 'Arabic') return 1;
    if (lang === 'English') return 2;
    return 1;
  }

  onImageUploaded(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Create local object URL for instant preview
      const previewUrl = URL.createObjectURL(file);
      this.localPreviewUrl.set(previewUrl);
      
      this.isUploading.set(true);
      this.adminApiService.uploadFile(file).subscribe({
        next: (res) => {
          this.form.patchValue({
            coverImageUrl: res
          });
          this.isUploading.set(false);
        },
        error: () => {
          this.isUploading.set(false);
          // Revert preview on upload error
          this.localPreviewUrl.set('');
        }
      });
    }
  }

  removeImage(): void {
    this.localPreviewUrl.set('');
    this.form.patchValue({
      coverImageUrl: ''
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
