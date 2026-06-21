import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, effect, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Locale = 'ar' | 'en';

@Injectable({
  providedIn: 'root'
})
export class LocaleService {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);

  // Active language signal, default to Arabic
  readonly currentLocale = signal<Locale>(this.getInitialLocale());

  constructor() {
    // Sync direction and html attributes whenever language changes
    effect(() => {
      const locale = this.currentLocale();
      localStorage.setItem('locale', locale);
      this.translate.use(locale);
      
      // Update HTML tags
      const htmlTag = this.document.documentElement;
      htmlTag.setAttribute('lang', locale);
      htmlTag.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    });
  }

  setLanguage(locale: Locale): void {
    this.currentLocale.set(locale);
  }

  toggleLanguage(): void {
    this.currentLocale.update(prev => prev === 'ar' ? 'en' : 'ar');
  }

  isRtl(): boolean {
    return this.currentLocale() === 'ar';
  }

  private getInitialLocale(): Locale {
    const saved = localStorage.getItem('locale') as Locale;
    if (saved === 'ar' || saved === 'en') {
      return saved;
    }
    
    // Check browser preference
    const browserLang = navigator.language || 'ar';
    return browserLang.startsWith('en') ? 'en' : 'ar';
  }
}
