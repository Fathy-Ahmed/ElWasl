import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { ContentService, TermStepItem } from '../../../core/services/content.service';
import { LocalizedTextPipe } from '../../../shared/pipes/localized-text.pipe';

@Component({
  selector: 'app-contract-terms',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    LocalizedTextPipe
  ],
  templateUrl: './contract-terms.component.html',
  styleUrls: ['./contract-terms.component.scss']
})
export class ContractTermsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly contentService = inject(ContentService);

  requestForm!: FormGroup;
  readonly isSubmitting = signal<boolean>(false);
  readonly selectedFile = signal<File | null>(null);
  readonly selectedCv = signal<File | null>(null);
  readonly publishingTerms = signal<TermStepItem[]>([]);

  ngOnInit(): void {
    this.requestForm = this.fb.group({
      authorName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      bookTitle: ['', Validators.required],
      summary: ['', [Validators.required, Validators.minLength(50)]]
    });

    const data = this.contentService.getCurrentHomepageData();
    this.publishingTerms.set(data.publishingTerms || []);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
    }
  }

  onCvSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedCv.set(input.files[0]);
    }
  }

  submitRequest(): void {
    if (this.requestForm.invalid || !this.selectedFile() || !this.selectedCv()) {
      this.requestForm.markAllAsTouched();
      if (!this.selectedFile()) {
        this.snackBar.open('يرجى إرفاق مسودة العمل / Please attach a manuscript file', 'إغلاق / Close', { duration: 3000 });
      } else if (!this.selectedCv()) {
        this.snackBar.open('يرجى إرفاق السيرة الذاتية / Please attach your CV', 'إغلاق / Close', { duration: 3000 });
      }
      return;
    }

    this.isSubmitting.set(true);

    // Simulate multipart request submission
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.snackBar.open('تم تقديم طلبك بنجاح! سنقوم بمراجعة طلبك والرد عليك.', 'إغلاق / Close', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      this.requestForm.reset();
      this.selectedFile.set(null);
      this.selectedCv.set(null);
    }, 2000);
  }
}
