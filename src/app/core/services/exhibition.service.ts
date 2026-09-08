import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { ExhibitionDto, ExhibitionCreateDto } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ExhibitionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.baseUrl}/api/v1/Exhibitions`;
  private readonly adminUrl = `${API_CONFIG.baseUrl}/api/v1/admin/exhibitions`;
  private readonly STORAGE_KEY = 'elwasl_exhibitions';

  private readonly initialExhibitions: ExhibitionDto[] = [
    {
      id: 'ex1',
      titleAr: 'معرض القاهرة الدولي للكتاب ٢٠٢٦',
      titleEn: 'Cairo International Book Fair 2026',
      dateAr: '٢٥ يناير - ٦ فبراير',
      dateEn: 'Jan 25 - Feb 06',
      location: 'مركز مصر للمعارض الدولية',
      locationAr: 'مركز مصر للمعارض الدولية',
      locationEn: 'Egypt International Exhibition Center',
      descriptionAr: 'شاركونا في أكبر عرس ثقافي في الشرق الأوسط. جناح دار الوصل صالة 1 جناح B12.',
      descriptionEn: 'Join us at the largest cultural event in the Middle East. ElWasl stand: Hall 1 Stand B12.',
      status: 'active',
      imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'ex2',
      titleAr: 'معرض الشارقة الدولي للكتاب ٢٠٢٦',
      titleEn: 'Sharjah International Book Fair 2026',
      dateAr: '١ نوفمبر - ١٢ نوفمبر',
      dateEn: 'Nov 01 - Nov 12',
      location: 'إكسبو الشارقة',
      locationAr: 'إكسبو الشارقة',
      locationEn: 'Expo Centre Sharjah',
      descriptionAr: 'جناح دار الوصل يضم أحدث إصداراتنا الحصرية من الروايات والألعاب التفاعلية.',
      descriptionEn: 'ElWasl booth featuring our latest exclusive novels and interactive card games.',
      status: 'upcoming',
      imageUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=800',
      image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=800'
    }
  ];

  getExhibitions(): Observable<ExhibitionDto[]> {
    return this.http.get<any>(this.baseUrl).pipe(
      map(res => {
        const items = Array.isArray(res) ? res : (res && Array.isArray(res.items) ? res.items : []);
        if (items && items.length > 0) {
          const mapped = items.map((item: any) => this.normalizeExhibition(item));
          this.syncStoredExhibitions(mapped);
          return this.getStoredExhibitions();
        }
        return this.getStoredExhibitions();
      }),
      catchError(() => of(this.getStoredExhibitions()))
    );
  }

  getExhibitionById(id: string): Observable<ExhibitionDto | undefined> {
    const local = this.getStoredExhibitions().find(e => e.id === id);
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      map(res => res ? this.normalizeExhibition(res) : local),
      catchError(() => of(local))
    );
  }

  createExhibition(dto: ExhibitionCreateDto): Observable<ExhibitionDto> {
    const exhibitions = this.getStoredExhibitions();
    const newId = `ex-${Date.now()}`;
    const newExhibition: ExhibitionDto = {
      id: newId,
      ...dto,
      locationAr: dto.locationAr || dto.location || '',
      locationEn: dto.locationEn || dto.location || '',
      location: dto.location || dto.locationAr || '',
      dateAr: dto.dateAr || '',
      dateEn: dto.dateEn || '',
      imageUrl: dto.imageUrl || dto.image || '',
      image: dto.image || dto.imageUrl || '',
      status: dto.status || 'upcoming'
    };

    exhibitions.unshift(newExhibition);
    this.saveStoredExhibitions(exhibitions);

    const payload = {
      titleAr: dto.titleAr,
      titleEn: dto.titleEn,
      descriptionAr: dto.descriptionAr || '',
      descriptionEn: dto.descriptionEn || '',
      location: dto.locationAr || dto.location || '',
      startDate: dto.startDate || new Date().toISOString(),
      endDate: dto.endDate || new Date().toISOString(),
      imageUrl: dto.imageUrl || dto.image || null
    };

    this.http.post<any>(this.adminUrl, payload).pipe(
      catchError(() => this.http.post<any>(this.baseUrl, payload))
    ).subscribe({
      next: (res) => {
        if (res && res.id) {
          const current = this.getStoredExhibitions();
          const idx = current.findIndex(e => e.id === newId);
          if (idx !== -1) {
            current[idx] = { ...current[idx], ...this.normalizeExhibition(res) };
            this.saveStoredExhibitions(current);
          }
        }
      },
      error: () => {}
    });

    return of(newExhibition);
  }

  updateExhibition(id: string, dto: Partial<ExhibitionDto>): Observable<void> {
    const exhibitions = this.getStoredExhibitions();
    const idx = exhibitions.findIndex(e => e.id === id);
    if (idx !== -1) {
      exhibitions[idx] = {
        ...exhibitions[idx],
        ...dto,
        locationAr: dto.locationAr || dto.location || exhibitions[idx].locationAr,
        locationEn: dto.locationEn || dto.location || exhibitions[idx].locationEn,
        location: dto.location || dto.locationAr || exhibitions[idx].location,
        imageUrl: dto.imageUrl || dto.image || exhibitions[idx].imageUrl,
        image: dto.image || dto.imageUrl || exhibitions[idx].image
      };
      this.saveStoredExhibitions(exhibitions);
    }

    const payload = {
      titleAr: dto.titleAr,
      titleEn: dto.titleEn,
      descriptionAr: dto.descriptionAr,
      descriptionEn: dto.descriptionEn,
      location: dto.locationAr || dto.location,
      imageUrl: dto.imageUrl || dto.image
    };

    this.http.put<void>(`${this.adminUrl}/${id}`, payload).pipe(
      catchError(() => this.http.put<void>(`${this.baseUrl}/${id}`, payload))
    ).subscribe({ error: () => {} });

    return of(void 0);
  }

  deleteExhibition(id: string): Observable<void> {
    const exhibitions = this.getStoredExhibitions().filter(e => e.id !== id);
    this.saveStoredExhibitions(exhibitions);

    this.http.delete<void>(`${this.adminUrl}/${id}`).pipe(
      catchError(() => this.http.delete<void>(`${this.baseUrl}/${id}`))
    ).subscribe({ error: () => {} });

    return of(void 0);
  }

  getStoredExhibitions(): ExhibitionDto[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(item => this.normalizeExhibition(item));
        }
      } catch {}
    }
    this.saveStoredExhibitions(this.initialExhibitions);
    return this.initialExhibitions;
  }

  private saveStoredExhibitions(items: ExhibitionDto[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }

  private syncStoredExhibitions(fetched: ExhibitionDto[]): void {
    try {
      const existing = this.getStoredExhibitions();
      const localOnly = existing.filter(e => e.id && e.id.startsWith('ex-'));
      const fetchedIds = new Set(fetched.map(e => e.id));
      const merged = [
        ...localOnly.filter(e => !fetchedIds.has(e.id)),
        ...fetched
      ];
      this.saveStoredExhibitions(merged);
    } catch {}
  }

  private normalizeExhibition(item: any): ExhibitionDto {
    return {
      id: item.id || `ex-${Date.now()}`,
      titleAr: item.titleAr || item.titleEn || 'معرض بدون عنوان',
      titleEn: item.titleEn || item.titleAr || 'Untitled Exhibition',
      descriptionAr: item.descriptionAr || '',
      descriptionEn: item.descriptionEn || '',
      location: item.location || item.locationAr || '',
      locationAr: item.locationAr || item.location || 'مركز المعارض',
      locationEn: item.locationEn || item.location || 'Exhibition Center',
      dateAr: item.dateAr || (item.startDate ? `${new Date(item.startDate).toLocaleDateString('ar-EG')} - ${new Date(item.endDate || item.startDate).toLocaleDateString('ar-EG')}` : 'الموعد يحدد لاحقاً'),
      dateEn: item.dateEn || (item.startDate ? `${new Date(item.startDate).toLocaleDateString('en-US')} - ${new Date(item.endDate || item.startDate).toLocaleDateString('en-US')}` : 'TBD'),
      startDate: item.startDate || null,
      endDate: item.endDate || null,
      imageUrl: item.imageUrl || item.image || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
      image: item.image || item.imageUrl || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
      status: item.status || 'upcoming'
    };
  }
}
