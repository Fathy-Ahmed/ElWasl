import { Injectable, signal, computed } from '@angular/core';

export type CurrencyCode = 'EGP' | 'USD';
export type RegionCode = 'EG' | 'OTHER';

export interface CurrencySettings {
  usdExchangeRate: number;      // e.g. 50 EGP per 1 USD
  defaultRegion: RegionCode;     // Fallback region if detection is unavailable ('EG' or 'OTHER')
}

const STORAGE_KEY_SETTINGS = 'elwasl_currency_settings';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  // Configurable admin settings
  readonly settings = signal<CurrencySettings>({
    usdExchangeRate: 50.0,
    defaultRegion: 'EG'
  });

  // Automatically detected region ('EG' for Egypt, 'OTHER' for any other country)
  readonly detectedRegion = signal<RegionCode>('EG');

  // Admin test simulation override (only used inside admin preview for testing)
  readonly adminTestRegion = signal<RegionCode | null>(null);

  constructor() {
    this.loadSettings();
    this.detectVisitorLocation();
  }

  // Active currency is strictly determined by location (EG -> EGP, International -> USD)
  readonly activeCurrency = computed<CurrencyCode>(() => {
    // 1. Admin test preview simulation
    const testRegion = this.adminTestRegion();
    if (testRegion) {
      return testRegion === 'EG' ? 'EGP' : 'USD';
    }

    // 2. Strict automated location check
    const region = this.detectedRegion();
    return region === 'EG' ? 'EGP' : 'USD';
  });

  // Get active currency symbol for layout
  getCurrencySymbol(lang: string = 'ar'): string {
    const cur = this.activeCurrency();
    if (cur === 'EGP') {
      return lang === 'ar' ? 'ج.م' : 'EGP';
    }
    return '$';
  }

  // Convert an EGP base price into USD or active currency
  convertPrice(amountInEgp: number | null | undefined, overrideCurrency?: CurrencyCode): number {
    if (amountInEgp === null || amountInEgp === undefined || isNaN(amountInEgp)) {
      return 0;
    }

    const cur = overrideCurrency || this.activeCurrency();
    if (cur === 'EGP') {
      return amountInEgp;
    }

    const rate = this.settings().usdExchangeRate || 50.0;
    if (rate <= 0) return amountInEgp;

    const usdVal = amountInEgp / rate;
    return Math.round(usdVal * 100) / 100;
  }

  // Format amount for display based on automated currency & locale
  formatPrice(amountInEgp: number | null | undefined, lang: string = 'ar'): string {
    if (amountInEgp === null || amountInEgp === undefined) return '';

    const cur = this.activeCurrency();
    const converted = this.convertPrice(amountInEgp, cur);

    const formattedVal = Number.isInteger(converted) ? converted.toString() : converted.toFixed(2);

    if (cur === 'EGP') {
      return lang === 'ar' ? `${formattedVal} ج.م` : `${formattedVal} EGP`;
    } else {
      return lang === 'ar' ? `${formattedVal} $` : `$${formattedVal}`;
    }
  }

  // Admin test simulation toggle
  setAdminTestRegion(region: RegionCode | null): void {
    this.adminTestRegion.set(region);
  }

  // Update admin settings
  updateSettings(newSettings: Partial<CurrencySettings>): void {
    this.settings.update(curr => {
      const updated = { ...curr, ...newSettings };
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
      return updated;
    });
  }

  private loadSettings(): void {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.settings.set({
          usdExchangeRate: typeof parsed.usdExchangeRate === 'number' && parsed.usdExchangeRate > 0 ? parsed.usdExchangeRate : 50.0,
          defaultRegion: parsed.defaultRegion === 'OTHER' ? 'OTHER' : 'EG'
        });
      } catch {}
    }
  }

  private detectVisitorLocation(): void {
    try {
      // 1. Timezone detection
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const lowerTz = timeZone.toLowerCase();
      
      // If timezone is Cairo / Egypt -> region is EG (EGP)
      if (lowerTz.includes('cairo') || lowerTz.includes('egypt')) {
        this.detectedRegion.set('EG');
        return;
      }

      // 2. Language / Locale region tag detection
      const lang = (navigator.language || '').toLowerCase();
      const languages = (navigator.languages || []).map(l => l.toLowerCase());
      const hasEgLocale = lang.includes('ar-eg') || lang.includes('en-eg') || languages.some(l => l.includes('-eg'));

      if (hasEgLocale) {
        this.detectedRegion.set('EG');
        return;
      }

      // 3. If timezone is explicitly specified and not Egypt -> International (USD)
      if (timeZone) {
        this.detectedRegion.set('OTHER');
      } else {
        // Fallback to admin default region setting
        this.detectedRegion.set(this.settings().defaultRegion);
      }
    } catch {
      this.detectedRegion.set(this.settings().defaultRegion);
    }
  }
}
