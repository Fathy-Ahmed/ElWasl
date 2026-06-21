import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CategoryDto } from '../../../../core/models/api.models';

@Component({
  selector: 'app-category-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.category ? 'تعديل التصنيف / Edit Category' : 'إضافة تصنيف جديد / Add Category' }}
    </h2>
    
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content class="mat-typography dialog-content">
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

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>الرابط الفريد / Slug</mat-label>
            <input matInput formControlName="slug" required>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>التصنيف الأب / Parent Category</mat-label>
            <mat-select formControlName="parentCategoryId">
              <mat-option [value]="null">-- لا يوجد / None --</mat-option>
              @for (cat of data.categories; track cat.id) {
                @if (cat.id !== data.category?.id) {
                  <mat-option [value]="cat.id">
                    {{ cat.nameAr }} / {{ cat.nameEn }}
                  </mat-option>
                }
              }
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>الوصف بالعربية / Description (AR)</mat-label>
          <textarea matInput formControlName="descriptionAr" rows="3"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>الوصف بالإنجليزية / Description (EN)</mat-label>
          <textarea matInput formControlName="descriptionEn" rows="3"></textarea>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button type="button" mat-button mat-dialog-close>إلغاء / Cancel</button>
        <button type="submit" mat-raised-button color="primary" [disabled]="form.invalid">حفظ / Save</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-width: 500px;
      padding-top: 10px;
    }
    .form-row {
      display: flex;
      gap: 16px;
    }
    .form-row mat-form-field {
      flex: 1;
    }
    .w-full {
      width: 100%;
    }
  `]
})
export class CategoryDialogComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<CategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { category?: CategoryDto; categories: CategoryDto[] }
  ) {}

  ngOnInit(): void {
    const cat = this.data.category;
    this.form = this.fb.group({
      nameAr: [cat?.nameAr || '', Validators.required],
      nameEn: [cat?.nameEn || '', Validators.required],
      slug: [cat?.slug || '', Validators.required],
      descriptionAr: [cat?.descriptionAr || ''],
      descriptionEn: [cat?.descriptionEn || ''],
      parentCategoryId: [cat?.parentCategoryId || null]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
