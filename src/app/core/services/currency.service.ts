import { Injectable, signal, computed } from '@angular/core';

export type CurrencyCode = 'EGP' | 'USD';
export type RegionCode = 'EG' | 'OTHER';

export interface CurrencySettings {
  usdExchangeRate: number;      // e.g. 50 EGP per 1 USD
  autoDetectRegion: boolean;    // Automatically detect Egypt vs International
  defaultRegion: RegionCode;     // Fallback region ('EG' or 'OTHER')
}

const STORAGE_KEY_SETTINGS = 'elwasl_currency_settings';
const STORAGE_KEY_USER_PREF = 'elwasl_user_currency_preference';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  // Configurable settings signal
  readonly settings = signal<CurrencySettings>({
    usdExchangeRate: 50.0,
    autoDetectRegion: true,
    defaultRegion: 'EG'
  });

  // User manual preference ('EGP' | 'USD' | null)
  private readonly userPreference = signal<CurrencyCode | null>(null);

  // System detected region ('EG' | 'OTHER')
  readonly detectedRegion = signal<RegionCode>('EG');

  constructor() {
    this.loadSettings();
    this.detectRegion();
  }

  // Active currency signal derived from preferences, settings, and detected region
  readonly activeCurrency = computed<CurrencyCode>(() => {
    // 1. User manual override takes highest precedence
    const userPref = this.userPreference();
    if (userPref) {
      return userPref;
    }

    // 2. If auto-detection is enabled, use detected region
    const cfg = this.settings();
    const region = cfg.autoDetectRegion ? this.detectedRegion() : cfg.defaultRegion;
    return region === 'EG' ? 'EGP' : 'USD';
  });

  // Active symbol derived from active currency and language
  getCurrencySymbol(lang: string = 'ar'): string {
    const cur = this.activeCurrency();
    if (cur === 'EGP') {
      return lang === 'ar' ? 'ج.م' : 'EGP';
    }
    return '$';
  }

  // Convert an EGP base price into the target or active currency
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
    // Format to 2 decimal places rounded
    return Math.round(usdVal * 100) / 100;
  }

  // Format amount for display based on active currency & locale
  formatPrice(amountInEgp: number | null | undefined, lang: string = 'ar'): string {
    if (amountInEgp === null || amountInEgp === undefined) return '';

    const cur = this.activeCurrency();
    const converted = this.convertPrice(amountInEgp, cur);

    // Format numbers
    const formattedVal = Number.isInteger(converted) ? converted.toString() : converted.toFixed(2);

    if (cur === 'EGP') {
      return lang === 'ar' ? `${formattedVal} ج.م` : `${formattedVal} EGP`;
    } else {
      // USD formatting
      return lang === 'ar' ? `${formattedVal} $` : `$${formattedVal}`;
    }
  }

  // Toggle or manually set user currency preference
  setCurrencyPreference(cur: CurrencyCode | null): void {
    this.userPreference.set(cur);
    if (cur) {
      localStorage.setItem(STORAGE_KEY_USER_PREF, cur);
    } else {
      localStorage.removeItem(STORAGE_KEY_USER_PREF);
    }
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
    // Load stored settings if present
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.settings.set({
          usdExchangeRate: typeof parsed.usdExchangeRate === 'number' && parsed.usdExchangeRate > 0 ? parsed.usdExchangeRate : 50.0,
          autoDetectRegion: typeof parsed.autoDetectRegion === 'boolean' ? parsed.autoDetectRegion : true,
          defaultRegion: parsed.defaultRegion === 'OTHER' ? 'OTHER' : 'EG'
        });
      } catch {}
    }

    // Load user preference if present
    const savedPref = localStorage.getItem(STORAGE_KEY_USER_PREF) as CurrencyCode;
    if (savedPref === 'EGP' || savedPref === 'USD') {
      this.userPreference.set(savedPref);
    }
  }

  private detectRegion(): void {
    try {
      // Detect browser timezone
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (timeZone.toLowerCase().includes('cairo') || timeZone.toLowerCase().includes('egypt')) {
        this.detectedRegion.set('EG');
      } else {
        // Default to Egypt if locale contains 'ar-EG', otherwise check timezone
        const lang = navigator.language || '';
        if (lang.toLowerCase().includes('eg')) {
          this.detectedRegion.set('EG');
        } else if (timeZone) {
          // If timezone exists and is not Cairo -> International
          this.detectedRegion.set('OTHER');
        } else {
          this.detectedRegion.set('EG');
        }
      }
    } catch {
      this.detectedRegion.set('EG');
    }
  }
}
