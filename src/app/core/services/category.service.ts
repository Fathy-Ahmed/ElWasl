import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { CategoryDto } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.baseUrl}/api/v1/Categories`;

  getCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(this.baseUrl);
  }
}
