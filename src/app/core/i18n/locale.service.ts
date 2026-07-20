import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, effect, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Locale = 'ar' | 'en' | 'fr';

@Injectable({
  providedIn: 'root'
})
export class LocaleService {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);

  // Active language signal, default to Arabic unless saved in localStorage
  readonly currentLocale = signal<Locale>(this.getInitialLocale());

  constructor() {
    this.translate.addLangs(['ar', 'en', 'fr']);
    this.translate.setDefaultLang('ar');
    
    const initial = this.currentLocale();
    this.translate.use(initial);
    this.updateHtmlTags(initial);

    // Sync direction and html attributes whenever language changes
    effect(() => {
      const locale = this.currentLocale();
      localStorage.setItem('locale', locale);
      this.translate.use(locale);
      this.updateHtmlTags(locale);
    });
  }

  setLanguage(locale: Locale): void {
    this.currentLocale.set(locale);
  }

  toggleLanguage(): void {
    this.currentLocale.update(prev => {
      if (prev === 'ar') return 'en';
      if (prev === 'en') return 'fr';
      return 'ar';
    });
  }

  isRtl(): boolean {
    return this.currentLocale() === 'ar';
  }

  private updateHtmlTags(locale: Locale): void {
    const htmlTag = this.document.documentElement;
    htmlTag.setAttribute('lang', locale);
    htmlTag.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
  }

  private getInitialLocale(): Locale {
    const saved = localStorage.getItem('locale') as Locale;
    if (saved === 'ar' || saved === 'en' || saved === 'fr') {
      return saved;
    }
    
    // Default to 'ar' for Dar ElWasl
    return 'ar';
  }
}

