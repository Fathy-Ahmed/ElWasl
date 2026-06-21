import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { LocaleService } from '../../../core/i18n/locale.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <button mat-stroked-button id="lang-switcher-btn" (click)="toggleLang()" class="lang-btn">
      {{ currentLang() === 'ar' ? 'English' : 'العربية' }}
    </button>
  `,
  styles: [`
    .lang-btn {
      font-weight: 600;
      border-radius: 20px;
      font-size: 0.875rem;
      border-color: rgba(255, 255, 255, 0.4);
      color: inherit;
      padding: 0 12px;
      height: 36px;
      line-height: 34px;
      transition: all 0.2s ease;
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        border-color: white;
      }
    }
  `]
})
export class LanguageSwitcherComponent {
  private readonly localeService = inject(LocaleService);

  readonly currentLang = this.localeService.currentLocale;

  toggleLang(): void {
    this.localeService.toggleLanguage();
  }
}
