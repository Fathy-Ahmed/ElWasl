import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { AdminPageHeaderComponent } from '../../shared/components/admin-page-header/admin-page-header.component';
import { ContentService, TermStepItem } from '../../../../core/services/content.service';

@Component({
  selector: 'app-contract-terms-editor-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    AdminPageHeaderComponent
  ],
  templateUrl: './contract-terms-editor-page.component.html',
  styleUrls: ['./contract-terms-editor-page.component.scss']
})
export class ContractTermsEditorPageComponent implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly snackBar = inject(MatSnackBar);

  readonly breadcrumbs = [
    { label: 'الرئيسية / Admin', route: '/admin' },
    { label: 'المحتوى / CMS' },
    { label: 'شروط التعاقد / Terms' }
  ];

  publishingTerms: TermStepItem[] = [];
  readonly isSaving = signal<boolean>(false);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const data = this.contentService.getCurrentHomepageData();
    this.publishingTerms = JSON.parse(JSON.stringify(data.publishingTerms || []));
  }

  addTermStep(): void {
    const newId = 'step_' + Date.now();
    const nextNum = this.publishingTerms.length + 1;
    this.publishingTerms.push({
      id: newId,
      stepNumber: nextNum,
      titleAr: 'مرحلة جديدة',
      titleEn: 'New Stage',
      descAr: 'اكتب تفاصيل المرحلة الجديدة هنا.',
      descEn: 'Write description of the new stage here.'
    });
    this.snackBar.open('تمت إضافة خطوة جديدة / New step added', 'موافق / OK', { duration: 2000 });
  }

  deleteTermStep(index: number): void {
    this.publishingTerms.splice(index, 1);
    this.publishingTerms.forEach((step, i) => {
      step.stepNumber = i + 1;
    });
    this.snackBar.open('تم حذف الخطوة / Step deleted', 'موافق / OK', { duration: 2000 });
  }

  saveContent(): void {
    this.isSaving.set(true);
    const data = this.contentService.getCurrentHomepageData();
    data.publishingTerms = this.publishingTerms;

    setTimeout(() => {
      this.contentService.saveHomepageData(data);
      this.isSaving.set(false);
      this.snackBar.open('تم حفظ شروط ومراحل النشر بنجاح / Publishing terms saved successfully', 'إغلاق / Close', { duration: 3000 });
    }, 1200);
  }

  resetDefaults(): void {
    if (confirm('هل أنت متأكد من رغبتك في استعادة الإعدادات الافتراضية؟ / Are you sure you want to reset to defaults?')) {
      this.contentService.resetToDefault();
      this.loadData();
      this.snackBar.open('تمت استعادة البيانات الافتراضية / Defaults restored successfully', 'إغلاق / Close', { duration: 3000 });
    }
  }
}
