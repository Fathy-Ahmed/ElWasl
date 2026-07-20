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

    const lang = this.localeService.currentLocale();
    
    // Resolve helper for a given language code (e.g. 'fr', 'en', 'ar')
    const getValueForLang = (l: string): string | undefined => {
      const langCapitalized = l.charAt(0).toUpperCase() + l.slice(1);
      
      // 1. Try camelCase (e.g., titleAr / titleEn / titleFr)
      const camelCaseKey = `${field}${langCapitalized}`;
      if (value[camelCaseKey] !== undefined && value[camelCaseKey] !== null && value[camelCaseKey] !== '') {
        return value[camelCaseKey];
      }

      // 2. Try snake_case (e.g., title_ar / title_en / title_fr)
      const snakeCaseKey = `${field}_${l}`;
      if (value[snakeCaseKey] !== undefined && value[snakeCaseKey] !== null && value[snakeCaseKey] !== '') {
        return value[snakeCaseKey];
      }

      // 3. Try PascalCase (e.g., TitleAr / TitleEn / TitleFr)
      const fieldCapitalized = field.charAt(0).toUpperCase() + field.slice(1);
      const pascalCaseKey = `${fieldCapitalized}${langCapitalized}`;
      if (value[pascalCaseKey] !== undefined && value[pascalCaseKey] !== null && value[pascalCaseKey] !== '') {
        return value[pascalCaseKey];
      }

      return undefined;
    };

    // 1. Try currently active language
    let result = getValueForLang(lang);
    if (result !== undefined) {
      return result;
    }

    // 2. If active language is French ('fr') but it wasn't found, fall back to English ('en')
    if (lang === 'fr') {
      result = getValueForLang('en');
      if (result !== undefined) {
        return result;
      }
    }

    // 3. Fallback to the raw field name (e.g. title)
    return value[field] || '';
  }
}
