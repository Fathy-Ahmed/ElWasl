import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TranslateModule } from '@ngx-translate/core';
import { AdminPageHeaderComponent } from '../../shared/components/admin-page-header/admin-page-header.component';
import { ContentService, ServiceItem, AuthorItem, DistributorItem, HomepageData } from '../../../../core/services/content.service';

@Component({
  selector: 'app-homepage-editor-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatSnackBarModule,
    AdminPageHeaderComponent
  ],
  templateUrl: './homepage-editor-page.component.html',
  styleUrls: ['./homepage-editor-page.component.scss']
})
export class HomepageEditorPageComponent implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly snackBar = inject(MatSnackBar);

  readonly breadcrumbs = [
    { label: 'الرئيسية / Admin', route: '/admin' },
    { label: 'المحتوى / CMS' },
    { label: 'تعديل الرئيسية / Homepage CMS' }
  ];

  readonly activeTab = signal<'services' | 'family' | 'distributors'>('services');
  readonly isSaving = signal<boolean>(false);

  // Editable local copies of state
  services: ServiceItem[] = [];
  authorCount: number = 374;
  authors: AuthorItem[] = [];
  distributors: DistributorItem[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const data = this.contentService.getCurrentHomepageData();
    // Deep clone to avoid direct mutation of service state before saving
    this.services = JSON.parse(JSON.stringify(data.services));
    this.authorCount = data.authorCount;
    this.authors = JSON.parse(JSON.stringify(data.authors));
    this.distributors = JSON.parse(JSON.stringify(data.distributors));
  }

  setTab(tab: 'services' | 'family' | 'distributors'): void {
    this.activeTab.set(tab);
  }

  // --- Services Management ---
  addService(): void {
    const newId = 'service_' + Date.now();
    this.services.push({
      id: newId,
      titleAr: 'خدمة جديدة',
      titleEn: 'New Service',
      descAr: 'وصف الخدمة الجديدة هنا.',
      descEn: 'Description of the new service goes here.',
      icon: 'star',
      visualType: 'default'
    });
    this.snackBar.open('تمت إضافة خدمة جديدة / New service added', 'موافق / OK', { duration: 2000 });
  }

  deleteService(index: number): void {
    this.services.splice(index, 1);
    this.snackBar.open('تم حذف الخدمة / Service deleted', 'موافق / OK', { duration: 2000 });
  }

  // --- Authors Management ---
  addAuthor(): void {
    this.authors.push({
      nameAr: 'اسم المؤلف الجديد',
      nameEn: 'New Author Name',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      countAr: '١ رواية',
      countEn: '1 Novel',
      bioAr: 'السيرة الذاتية للمؤلف الجديد باللغة العربية.',
      bioEn: 'Biography of the new author in English.'
    });
    this.snackBar.open('تمت إضافة مؤلف جديد / New author added', 'موافق / OK', { duration: 2000 });
  }

  deleteAuthor(index: number): void {
    this.authors.splice(index, 1);
    this.snackBar.open('تم حذف المؤلف / Author deleted', 'موافق / OK', { duration: 2000 });
  }

  // --- Distributors Management ---
  addDistributor(): void {
    const newId = 'dist_' + Date.now();
    this.distributors.push({
      id: newId,
      nameAr: 'منفذ توزيع جديد',
      nameEn: 'New Distributor Branch',
      addressAr: 'العنوان بالتفصيل هنا - القاهرة',
      addressEn: 'Detailed address here - Cairo',
      phone: '+201118440716',
      email: 'elwaslbook2023@gmail.com',
      hoursAr: '٩:٠٠ ص - ١٠:٠٠ م',
      hoursEn: '9:00 AM - 10:00 PM',
      cx: 150,
      cy: 100,
      r: 3,
      class: 'map-dot'
    });
    this.snackBar.open('تمت إضافة منفذ جديد / New branch added', 'موافق / OK', { duration: 2000 });
  }

  deleteDistributor(index: number): void {
    this.distributors.splice(index, 1);
    this.snackBar.open('تم حذف المنفذ / Branch deleted', 'موافق / OK', { duration: 2000 });
  }

  // --- Global Saving ---
  saveAll(): void {
    this.isSaving.set(true);
    const dataToSave: HomepageData = {
      services: this.services,
      authorCount: this.authorCount,
      authors: this.authors,
      distributors: this.distributors
    };

    setTimeout(() => {
      this.contentService.saveHomepageData(dataToSave);
      this.isSaving.set(false);
      this.snackBar.open('تم حفظ التغييرات بنجاح / Homepage content saved successfully', 'إغلاق / Close', { duration: 3000 });
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
