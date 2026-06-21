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
  selector: 'app-about-us-editor-page',
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
  templateUrl: './about-us-editor-page.component.html',
  styleUrls: ['./about-us-editor-page.component.scss']
})
export class AboutUsEditorPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly breadcrumbs = [
    { label: 'الرئيسية / Admin', route: '/admin' },
    { label: 'المحتوى / CMS' },
    { label: 'من نحن / About Us' }
  ];

  editorForm!: FormGroup;
  readonly activeLangTab = signal<'ar' | 'en'>('ar');
  readonly isSaving = signal<boolean>(false);

  ngOnInit(): void {
    // Mock load CMS initial values
    this.editorForm = this.fb.group({
      aboutAr: [`تأسست دار الوصل للنشر بهدف سد الفجوة الثقافية وتقديم إسهامات فكرية وأدبية متميزة باللغتين العربية والإنجليزية. نحن نسعى لتقديم أفضل الروايات والكتب المعرفية التي تلهم العقول وتغذي شغف القراء في كل مكان.`, Validators.required],
      aboutEn: [`We established ElWasl Publishing with the goal of bridging cultural gaps and presenting distinguished intellectual and literary contributions in both Arabic and English. We strive to offer the best novels and educational books that inspire minds and feed the passion of readers everywhere.`, Validators.required]
    });
  }

  saveContent(): void {
    if (this.editorForm.invalid) {
      return;
    }

    this.isSaving.set(true);

    // Simulate saving delay
    setTimeout(() => {
      this.isSaving.set(false);
      this.snackBar.open('تم حفظ المحتوى التعريفي بنجاح / Content saved successfully', 'إغلاق / Close', { duration: 3000 });
    }, 1500);
  }

  setLangTab(lang: 'ar' | 'en'): void {
    this.activeLangTab.set(lang);
  }
}
