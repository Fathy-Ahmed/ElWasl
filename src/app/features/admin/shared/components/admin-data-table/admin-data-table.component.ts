import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { CurrencyEgpPipe } from '../../../../../shared/pipes/currency-egp.pipe';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { ImageUrlPipe } from '../../../../../shared/pipes/image-url.pipe';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'currency' | 'date' | 'badge' | 'image';
  badgeLabelKey?: string; // Optional field in row to use as badge text
}

@Component({
  selector: 'app-admin-data-table',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    CurrencyEgpPipe,
    StatusBadgeComponent,
    ImageUrlPipe
  ],
  templateUrl: './admin-data-table.component.html',
  styleUrls: ['./admin-data-table.component.scss']
})
export class AdminDataTableComponent {
  @Input({ required: true }) columns: TableColumn[] = [];
  @Input({ required: true }) data: any[] = [];
  @Input() actions: { name: string; icon: string; color?: string; idPrefix?: string }[] = [];

  @Output() actionClick = new EventEmitter<{ action: string; row: any }>();
}
