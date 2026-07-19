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
import { AdminApiService } from '../../../../core/services/admin-api.service';
import { ImageUrlPipe } from '../../../../shared/pipes/image-url.pipe';

@Component({
  selector: 'app-game-dialog',
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
      {{ data.game ? 'تعديل لعبة ورق / Edit Card Game' : 'إضافة لعبة ورق جديدة / Add Card Game' }}
    </h2>
    
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content class="mat-typography dialog-content">
        <!-- Row 1: Names -->
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>الاسم بالعربية / Name (AR)</mat-label>
            <input matInput formControlName="nameAr" required>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>الاسم بالإنجليزية / Name (EN)</mat-label>
            <input matInput formControlName="nameEn" required>
          </mat-form-field>
        </div>

        <!-- Row 2: Tag & Image Upload -->
        <div class="form-row image-upload-row">
          <mat-form-field appearance="outline">
            <mat-label>تصنيف/وسم اللعبة / Category Tag</mat-label>
            <input matInput formControlName="categoryTag">
          </mat-form-field>

          <div class="image-upload-container">
            <mat-form-field appearance="outline">
              <mat-label>رابط الصورة / Image URL</mat-label>
              <input matInput formControlName="imageUrl">
            </mat-form-field>
            <button type="button" mat-stroked-button color="primary" class="upload-btn" [disabled]="isUploading()" (click)="fileInput.click()">
              <mat-icon>cloud_upload</mat-icon>
              {{ isUploading() ? 'جاري الرفع...' : 'رفع صورة / Upload' }}
            </button>
            <input type="file" #fileInput style="display: none;" accept="image/*" (change)="onImageUploaded($event)">
          </div>
        </div>

        <!-- Image Preview Block -->
        @if (localPreviewUrl() || form.get('imageUrl')?.value) {
          <div class="image-preview-container">
            <span class="preview-label">معاينة الصورة / Image Preview:</span>
            <div class="image-preview">
              <img [src]="localPreviewUrl() || (form.get('imageUrl')?.value | imageUrl)" alt="Preview" class="preview-img">
              <button type="button" mat-icon-button color="warn" class="remove-img-btn" (click)="removeImage()">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
        }

        <!-- Row 3: Player Counts & Stock -->
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>أقل عدد لاعبين / Min Players</mat-label>
            <input type="number" matInput formControlName="playerCountMin" required min="1">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>أقصى عدد لاعبين / Max Players</mat-label>
            <input type="number" matInput formControlName="playerCountMax" required min="1">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>المخزون / Stock</mat-label>
            <input type="number" matInput formControlName="stock" required min="0">
          </mat-form-field>
        </div>

        <!-- Row 4: Price (EGP & USD) -->
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>السعر بالجنيه / Price (EGP)</mat-label>
            <input type="number" matInput formControlName="price" required min="0">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>السعر بالدولار ($) / Price (USD)</mat-label>
            <input type="number" matInput formControlName="priceUsd" min="0" step="0.5">
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
        @if (data.game) {
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
export class GameDialogComponent implements OnInit {
  private readonly adminApiService = inject(AdminApiService);
  form!: FormGroup;
  readonly isUploading = signal<boolean>(false);
  readonly localPreviewUrl = signal<string>('');

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<GameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { game?: any }
  ) {}

  ngOnInit(): void {
    const g = this.data.game;
    this.form = this.fb.group({
      nameAr: [g?.titleAr || g?.nameAr || '', Validators.required],
      nameEn: [g?.titleEn || g?.nameEn || '', Validators.required],
      categoryTag: [g?.categoryTag || ''],
      imageUrl: [g?.coverImage || g?.imageUrl || ''],
      playerCountMin: [g?.playerCountMin || g?.raw?.playerCountMin || 2, [Validators.required, Validators.min(1)]],
      playerCountMax: [g?.playerCountMax || g?.raw?.playerCountMax || 4, [Validators.required, Validators.min(1)]],
      stock: [g?.stock || 0, [Validators.required, Validators.min(0)]],
      price: [g?.price || 0, [Validators.required, Validators.min(0)]],
      priceUsd: [g?.priceUsd !== undefined && g?.priceUsd !== null ? g.priceUsd : (g?.raw?.priceUsd || null), Validators.min(0)],
      descriptionAr: [g?.descriptionAr || g?.raw?.descriptionAr || ''],
      descriptionEn: [g?.descriptionEn || g?.raw?.descriptionEn || ''],
      isActive: [g?.isActive !== undefined ? g.isActive : true]
    });
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
            imageUrl: res
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
      imageUrl: ''
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const val = { ...this.form.value };
      if (!val.categoryTag) val.categoryTag = null;
      if (!val.imageUrl) val.imageUrl = null;
      if (!val.descriptionAr) val.descriptionAr = null;
      if (!val.descriptionEn) val.descriptionEn = null;
      this.dialogRef.close(val);
    }
  }
}
