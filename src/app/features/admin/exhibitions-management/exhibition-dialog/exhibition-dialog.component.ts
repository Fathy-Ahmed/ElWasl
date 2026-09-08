import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AdminApiService } from '../../../../core/services/admin-api.service';
import { ImageUrlPipe } from '../../../../shared/pipes/image-url.pipe';
import { ExhibitionDto } from '../../../../core/models/api.models';

@Component({
  selector: 'app-exhibition-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    ImageUrlPipe
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.exhibition ? 'تعديل المعرض / Edit Exhibition' : 'إضافة معرض جديد / Add Exhibition' }}
    </h2>
    
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content class="mat-typography dialog-content">
        <!-- Row 1: Titles -->
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>اسم المعرض بالعربية / Title (AR)</mat-label>
            <input matInput formControlName="titleAr" required placeholder="مثال: معرض القاهرة الدولي للكتاب ٢٠٢٦">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>اسم المعرض بالإنجليزية / Title (EN)</mat-label>
            <input matInput formControlName="titleEn" required placeholder="e.g. Cairo International Book Fair 2026">
          </mat-form-field>
        </div>

        <!-- Row 2: Locations -->
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>الموقع بالعربية / Location (AR)</mat-label>
            <input matInput formControlName="locationAr" required placeholder="مثال: مركز مصر للمعارض الدولية">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>الموقع بالإنجليزية / Location (EN)</mat-label>
            <input matInput formControlName="locationEn" placeholder="e.g. Egypt International Exhibition Center">
          </mat-form-field>
        </div>

        <!-- Row 3: Dates & Status -->
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>التاريخ بالعربية / Date (AR)</mat-label>
            <input matInput formControlName="dateAr" placeholder="مثال: ٢٥ يناير - ٦ فبراير">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>التاريخ بالإنجليزية / Date (EN)</mat-label>
            <input matInput formControlName="dateEn" placeholder="e.g. Jan 25 - Feb 06">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>حالة المعرض / Status</mat-label>
            <mat-select formControlName="status" required>
              <mat-option value="active">جارٍ حالياً / Active</mat-option>
              <mat-option value="upcoming">قادم قريباً / Upcoming</mat-option>
              <mat-option value="past">معرض سابق / Past</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <!-- Row 4: Image Upload -->
        <div class="form-row image-upload-row">
          <div class="image-upload-container">
            <mat-form-field appearance="outline" class="flex-grow">
              <mat-label>رابط صورة المعرض / Image URL</mat-label>
              <input matInput formControlName="imageUrl" placeholder="https://... أو ارفع صورة">
            </mat-form-field>
            <button type="button" mat-stroked-button color="primary" class="upload-btn" [disabled]="isUploading()" (click)="fileInput.click()">
              <mat-icon>cloud_upload</mat-icon>
              {{ isUploading() ? 'جاري الرفع...' : 'رفع صورة / Upload' }}
            </button>
            <input type="file" #fileInput style="display: none;" accept="image/*" (change)="onImageUploaded($event)">
          </div>
        </div>

        <!-- Image Preview -->
        @if (form.get('imageUrl')?.value) {
          <div class="image-preview-container">
            <span class="preview-label">معاينة الصورة / Preview:</span>
            <div class="image-preview">
              <img [src]="form.get('imageUrl')?.value | imageUrl" alt="Exhibition Preview" class="preview-img">
              <button type="button" mat-icon-button color="warn" class="remove-img-btn" (click)="removeImage()" title="حذف الصورة / Remove">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
        }

        <!-- Descriptions -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>الوصف بالعربية / Description (AR)</mat-label>
          <textarea matInput formControlName="descriptionAr" rows="2" placeholder="وصف تفاصيل المشاركة ورقم الجناح..."></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>الوصف بالإنجليزية / Description (EN)</mat-label>
          <textarea matInput formControlName="descriptionEn" rows="2" placeholder="Participation details, booth number..."></textarea>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button type="button" mat-button mat-dialog-close>إلغاء / Cancel</button>
        <button type="submit" mat-flat-button color="primary" [disabled]="form.invalid">حفظ / Save</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-width: 550px;
      max-width: 750px;
      padding-top: 10px;
    }
    .form-row {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .form-row mat-form-field {
      flex: 1;
    }
    .image-upload-row {
      margin-bottom: 8px;
    }
    .image-upload-container {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
    }
    .flex-grow {
      flex: 1;
    }
    .upload-btn {
      height: 54px;
      margin-bottom: 22px;
      white-space: nowrap;
    }
    .image-preview-container {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;
    }
    .preview-label {
      font-size: 0.85rem;
      color: #666;
      font-weight: 500;
    }
    .image-preview {
      position: relative;
      display: inline-block;
      width: 180px;
      height: 100px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #ddd;
    }
    .preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .remove-img-btn {
      position: absolute;
      top: 4px;
      right: 4px;
      background: rgba(255, 255, 255, 0.9);
      width: 30px;
      height: 30px;
      line-height: 30px;
    }
    .w-full {
      width: 100%;
    }
    .dialog-actions {
      padding: 16px 24px;
      gap: 8px;
    }
  `]
})
export class ExhibitionDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ExhibitionDialogComponent>);
  private readonly adminApiService = inject(AdminApiService);

  readonly isUploading = signal<boolean>(false);

  form!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { exhibition?: ExhibitionDto }
  ) {}

  ngOnInit(): void {
    const ex = this.data.exhibition;
    this.form = this.fb.group({
      titleAr: [ex?.titleAr || '', Validators.required],
      titleEn: [ex?.titleEn || '', Validators.required],
      locationAr: [ex?.locationAr || ex?.location || '', Validators.required],
      locationEn: [ex?.locationEn || ex?.location || ''],
      dateAr: [ex?.dateAr || ''],
      dateEn: [ex?.dateEn || ''],
      status: [ex?.status || 'upcoming', Validators.required],
      imageUrl: [ex?.imageUrl || ex?.image || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800'],
      descriptionAr: [ex?.descriptionAr || ''],
      descriptionEn: [ex?.descriptionEn || '']
    });
  }

  onImageUploaded(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.isUploading.set(true);
    this.adminApiService.uploadFile(file).subscribe({
      next: (url) => {
        this.form.patchValue({ imageUrl: url });
        this.isUploading.set(false);
      },
      error: () => {
        this.isUploading.set(false);
      }
    });
  }

  removeImage(): void {
    this.form.patchValue({ imageUrl: '' });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formVal = this.form.value;
      const result = {
        ...formVal,
        image: formVal.imageUrl,
        location: formVal.locationAr || formVal.locationEn
      };
      this.dialogRef.close(result);
    }
  }
}
