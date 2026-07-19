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
  selector: 'app-audiobook-dialog',
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
      {{ data.audiobook ? 'تعديل كتاب صوتي / Edit Audiobook' : 'إضافة كتاب صوتي جديد / Add Audiobook' }}
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

        <!-- Row 2: Narrator & Duration -->
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>الراوي / Narrator Name</mat-label>
            <input matInput formControlName="narratorName" required>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>المدة بالدقائق / Duration (Minutes)</mat-label>
            <input type="number" matInput formControlName="durationMinutes" required min="0">
          </mat-form-field>
        </div>

        <!-- Row 3: Image Upload & Audio URL -->
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
            <mat-label>رابط ملف الصوت / Audio File URL</mat-label>
            <input matInput formControlName="audioFileUrl">
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

        <!-- Row 4: Price (EGP & USD) & Book Link -->
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>السعر بالجنيه / Price (EGP)</mat-label>
            <input type="number" matInput formControlName="price" required min="0">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>السعر بالدولار ($) / Price (USD)</mat-label>
            <input type="number" matInput formControlName="priceUsd" min="0" step="0.5">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>مرتبط بكتاب مطبوع / Linked Printed Book (Optional)</mat-label>
            <mat-select formControlName="bookId">
              <mat-option [value]="null">-- لا يوجد / None --</mat-option>
              @for (b of printedBooks; track b.id) {
                <mat-option [value]="b.id">
                  {{ b.titleAr }} / {{ b.titleEn }}
                </mat-option>
              }
            </mat-select>
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
        @if (data.audiobook) {
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
export class AudiobookDialogComponent implements OnInit {
  private readonly adminApiService = inject(AdminApiService);
  form!: FormGroup;
  printedBooks: any[] = [];
  readonly isUploading = signal<boolean>(false);
  readonly localPreviewUrl = signal<string>('');

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<AudiobookDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { audiobook?: any }
  ) {}

  ngOnInit(): void {
    // Load printed books to link
    this.adminApiService.getBooks('', 1, 100).subscribe(res => {
      this.printedBooks = res.items || [];
    });

    const a = this.data.audiobook || {};
    const raw = a.raw || {};
    const priceUsdVal = (a.priceUsd !== undefined && a.priceUsd !== null) ? a.priceUsd : (raw.priceUsd !== undefined ? raw.priceUsd : null);

    this.form = this.fb.group({
      titleAr: [a.titleAr || raw.titleAr || '', Validators.required],
      titleEn: [a.titleEn || raw.titleEn || '', Validators.required],
      narratorName: [a.narratorName || a.authorAr || raw.narratorName || raw.authorAr || '', Validators.required],
      durationMinutes: [a.durationMinutes !== undefined ? a.durationMinutes : (raw.durationMinutes || 0), [Validators.required, Validators.min(0)]],
      coverImageUrl: [a.coverImageUrl || a.coverImage || raw.coverImageUrl || raw.coverImage || ''],
      audioFileUrl: [a.audioFileUrl || raw.audioFileUrl || ''],
      price: [a.price !== undefined ? a.price : (raw.price || 0), [Validators.required, Validators.min(0)]],
      priceUsd: [priceUsdVal, Validators.min(0)],
      bookId: [a.bookId || raw.bookId || null],
      descriptionAr: [a.descriptionAr || raw.descriptionAr || ''],
      descriptionEn: [a.descriptionEn || raw.descriptionEn || ''],
      isActive: [a.isActive !== undefined ? a.isActive : (raw.isActive !== undefined ? raw.isActive : true)]
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
      const val = { ...this.form.value };
      if (!val.coverImageUrl) val.coverImageUrl = null;
      if (!val.audioFileUrl) val.audioFileUrl = null;
      if (val.bookId === '' || val.bookId === null || val.bookId === undefined) {
        val.bookId = null;
      }
      if (!val.descriptionAr) val.descriptionAr = null;
      if (!val.descriptionEn) val.descriptionEn = null;
      this.dialogRef.close(val);
    }
  }
}
