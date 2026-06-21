import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { AdminPageHeaderComponent } from '../../shared/components/admin-page-header/admin-page-header.component';

@Component({
  selector: 'app-contract-terms-editor-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    AdminPageHeaderComponent
  ],
  templateUrl: './contract-terms-editor-page.component.html',
  styleUrls: ['./contract-terms-editor-page.component.scss']
})
export class ContractTermsEditorPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly breadcrumbs = [
    { label: 'الرئيسية / Admin', route: '/admin' },
    { label: 'المحتوى / CMS' },
    { label: 'شروط التعاقد / Terms' }
  ];

  editorForm!: FormGroup;
  readonly activeLangTab = signal<'ar' | 'en'>('ar');
  readonly isSaving = signal<boolean>(false);

  ngOnInit(): void {
    this.editorForm = this.fb.group({
      termsAr: [`يتم مراجعة العمل من قبل لجنة قراءة مختصة. عند الموافقة يتم التوقيع على عقد توزيع ونشر للنسخ المطبوعة والصوتية.`, Validators.required],
      termsEn: [`Manuscripts are reviewed by a reading committee. Upon approval, intellectual property contracts for print and audio publishing are signed.`, Validators.required]
    });
  }

  saveContent(): void {
    if (this.editorForm.invalid) {
      return;
    }

    this.isSaving.set(true);

    setTimeout(() => {
      this.isSaving.set(false);
      this.snackBar.open('تم حفظ شروط النشر بنجاح / Terms saved successfully', 'إغلاق / Close', { duration: 3000 });
    }, 1500);
  }

  setLangTab(lang: 'ar' | 'en'): void {
    this.activeLangTab.set(lang);
  }
}
