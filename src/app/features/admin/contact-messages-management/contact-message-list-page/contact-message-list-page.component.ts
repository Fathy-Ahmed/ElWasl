import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AdminPageHeaderComponent } from '../../shared/components/admin-page-header/admin-page-header.component';
import { AdminDataTableComponent, TableColumn } from '../../shared/components/admin-data-table/admin-data-table.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-contact-message-list-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, AdminPageHeaderComponent, AdminDataTableComponent],
  template: `
    <div class="management-page">
      <app-admin-page-header title="إدارة رسائل اتصل بنا / Contact Messages" 
                             subtitle="الاستجابة لرسائل الدعم والاقتراحات والشكاوى المرسلة من العملاء."
                             [breadcrumbs]="breadcrumbs">
      </app-admin-page-header>

      <app-admin-data-table [columns]="tableColumns" 
                             [data]="messages()" 
                             [actions]="tableActions"
                             (actionClick)="handleAction($event)">
      </app-admin-data-table>
    </div>
  `,
  styles: []
})
export class ContactMessageListPageComponent implements OnInit {
  private readonly MESSAGES_KEY = 'elwasl_contact_messages';

  constructor(private snackBar: MatSnackBar) {}

  readonly breadcrumbs = [
    { label: 'الرئيسية / Admin', route: '/admin' },
    { label: 'الرسائل / Messages' }
  ];

  readonly tableColumns: TableColumn[] = [
    { key: 'id', label: 'المعرف / ID' },
    { key: 'senderName', label: 'المرسل / Sender' },
    { key: 'subject', label: 'الموضوع / Subject' },
    { key: 'type', label: 'النوع / Type' },
    { key: 'date', label: 'التاريخ / Date', type: 'date' },
    { key: 'status', label: 'الحالة / Status', type: 'badge' }
  ];

  readonly tableActions = [
    { name: 'resolve', icon: 'check_circle', color: 'accent', idPrefix: 'resolve-msg-' }
  ];

  readonly messages = signal<any[]>([]);

  ngOnInit(): void {
    this.loadMessages();
  }

  @HostListener('window:storage')
  onStorageChange(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    const defaults = [
      { id: 'cm-101', senderName: 'ياسمين طه', email: 'yasmeen@gmail.com', subject: 'تأخر شحن طلبية عزازيل', type: 'شكوى / Complaint', status: 'pending', date: '2026-06-21' },
      { id: 'cm-102', senderName: 'كريم رأفت', email: 'karim@gmail.com', subject: 'اقتراح باقات روايات جديدة', type: 'اقتراح / Suggestion', status: 'delivered', date: '2026-06-20' }
    ];

    try {
      const raw = localStorage.getItem(this.MESSAGES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const ids = new Set(parsed.map(p => p.id));
          const combined = [
            ...parsed,
            ...defaults.filter(d => !ids.has(d.id))
          ];
          this.messages.set(combined);
          return;
        }
      }
    } catch {}

    localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(defaults));
    this.messages.set(defaults);
  }

  handleAction(event: { action: string; row: any }): void {
    const msgId = event.row.id;
    if (event.action === 'resolve') {
      this.messages.update(current => {
        const updated = current.map(m => m.id === msgId ? { ...m, status: 'delivered' } : m);
        try {
          localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(updated));
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('storage'));
          }
        } catch {}
        return updated;
      });
      this.snackBar.open(`تم وضع علامة مقروء ومحلول على الرسالة ${msgId} / Message resolved`, 'إغلاق / Close', { duration: 3000 });
    }
  }
}
