import { Pipe, PipeTransform, inject } from '@angular/core';
import { LocaleService } from '../../core/i18n/locale.service';
import { CurrencyService } from '../../core/services/currency.service';

@Pipe({
  name: 'currencyEgp',
  standalone: true,
  pure: false
})
export class CurrencyEgpPipe implements PipeTransform {
  private readonly localeService = inject(LocaleService);
  private readonly currencyService = inject(CurrencyService);

  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) return '';

    const lang = this.localeService.currentLocale();
    return this.currencyService.formatPrice(value, lang);
  }
}
