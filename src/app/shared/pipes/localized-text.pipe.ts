import { Pipe, PipeTransform, inject } from '@angular/core';
import { LocaleService } from '../../core/i18n/locale.service';

@Pipe({
  name: 'localizedText',
  standalone: true,
  pure: false // Not pure because it depends on LocaleService signal which can change
})
export class LocalizedTextPipe implements PipeTransform {
  private readonly localeService = inject(LocaleService);

  transform(value: any, field: string): string {
    if (!value) return '';

    const lang = this.localeService.currentLocale(); // 'ar' or 'en'
    
    // Capitalize language code for camelCase fields (e.g. TitleAr, TitleEn)
    const langCapitalized = lang.charAt(0).toUpperCase() + lang.slice(1);
    
    // Try camelCase with capital (e.g., titleAr / titleEn)
    const camelCaseKey = `${field}${langCapitalized}`;
    if (value[camelCaseKey] !== undefined) {
      return value[camelCaseKey];
    }

    // Try snake_case (e.g., title_ar / title_en)
    const snakeCaseKey = `${field}_${lang}`;
    if (value[snakeCaseKey] !== undefined) {
      return value[snakeCaseKey];
    }

    // Try case-sensitive camelCase (e.g., TitleAr)
    const fieldCapitalized = field.charAt(0).toUpperCase() + field.slice(1);
    const pascalCaseKey = `${fieldCapitalized}${langCapitalized}`;
    if (value[pascalCaseKey] !== undefined) {
      return value[pascalCaseKey];
    }

    // Fallback to exact field name
    return value[field] || '';
  }
}
