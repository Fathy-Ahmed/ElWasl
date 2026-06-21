import { Pipe, PipeTransform, inject } from '@angular/core';
import { LocaleService } from '../../core/i18n/locale.service';

@Pipe({
  name: 'currencyEgp',
  standalone: true,
  pure: false
})
export class CurrencyEgpPipe implements PipeTransform {
  private readonly localeService = inject(LocaleService);

  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) return '';

    const lang = this.localeService.currentLocale();
    
    // Format to 2 decimal places if there are piastres, or keep as integer
    const formattedVal = Number.isInteger(value) ? value.toString() : value.toFixed(2);
    
    if (lang === 'ar') {
      return `${formattedVal} ج.م`;
    }
    
    return `${formattedVal} EGP`;
  }
}
