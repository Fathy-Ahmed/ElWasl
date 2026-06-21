import { Pipe, PipeTransform } from '@angular/core';
import { API_CONFIG } from '../../core/config/api.config';

@Pipe({
  name: 'imageUrl',
  standalone: true
})
export class ImageUrlPipe implements PipeTransform {
  transform(url: string | null | undefined, defaultPlaceholder = ''): string {
    if (!url) return defaultPlaceholder;
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const baseUrl = API_CONFIG.baseUrl;
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }
}
