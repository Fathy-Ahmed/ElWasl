import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

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
    MatCheckboxModule
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

        <!-- Row 2: Tag & Image URL -->
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>تصنيف/وسم اللعبة / Category Tag</mat-label>
            <input matInput formControlName="categoryTag">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>رابط الصورة / Image URL</mat-label>
            <input matInput formControlName="imageUrl">
          </mat-form-field>
        </div>

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

        <!-- Row 4: Price -->
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>السعر / Price</mat-label>
            <input type="number" matInput formControlName="price" required min="0">
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
        <button type="submit" mat-raised-button color="primary" [disabled]="form.invalid">حفظ / Save</button>
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
  form!: FormGroup;

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
      descriptionAr: [g?.descriptionAr || g?.raw?.descriptionAr || ''],
      descriptionEn: [g?.descriptionEn || g?.raw?.descriptionEn || ''],
      isActive: [g?.isActive !== undefined ? g.isActive : true]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
