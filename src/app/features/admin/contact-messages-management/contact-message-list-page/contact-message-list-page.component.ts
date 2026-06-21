import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
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
export class ContactMessageListPageComponent {
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
    { key: 'status', label: 'الحالة / Status', type: 'badge' }
  ];

  readonly tableActions = [
    { name: 'resolve', icon: 'check_circle', color: 'accent', idPrefix: 'resolve-msg-' }
  ];

  readonly messages = signal([
    { id: 'cm-101', senderName: 'ياسمين طه', subject: 'تأخر شحن طلبية عزازيل', type: 'شكوى / Complaint', status: 'pending' },
    { id: 'cm-102', senderName: 'كريم رأفت', subject: 'اقتراح باقات روايات جديدة', type: 'اقتراح / Suggestion', status: 'delivered' }
  ]);

  handleAction(event: { action: string; row: any }): void {
    const msgId = event.row.id;
    if (event.action === 'resolve') {
      this.messages.update(current => 
        current.map(m => m.id === msgId ? { ...m, status: 'delivered' } : m)
      );
      this.snackBar.open(`تم وضع علامة مقروء ومحلول على الرسالة ${msgId} / Message resolved`, 'إغلاق / Close', { duration: 3000 });
    }
  }
}
