import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { CurrencyService, CurrencySettings, RegionCode } from '../../../core/services/currency.service';
import { CurrencyEgpPipe } from '../../../shared/pipes/currency-egp.pipe';

@Component({
  selector: 'app-currency-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatSnackBarModule,
    CurrencyEgpPipe
  ],
  templateUrl: './currency-settings-page.component.html',
  styleUrls: ['./currency-settings-page.component.scss']
})
export class CurrencySettingsPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly currencyService = inject(CurrencyService);
  private readonly snackBar = inject(MatSnackBar);

  settingsForm!: FormGroup;

  // Sample book prices for live preview simulator
  readonly samplePrices = [50, 150, 300, 600];

  ngOnInit(): void {
    const current = this.currencyService.settings();
    this.settingsForm = this.fb.group({
      usdExchangeRate: [current.usdExchangeRate, [Validators.required, Validators.min(0.01)]],
      defaultRegion: [current.defaultRegion, [Validators.required]]
    });
  }

  saveSettings(): void {
    if (this.settingsForm.invalid) return;

    const val = this.settingsForm.value;
    const updated: Partial<CurrencySettings> = {
      usdExchangeRate: parseFloat(val.usdExchangeRate),
      defaultRegion: val.defaultRegion as RegionCode
    };

    this.currencyService.updateSettings(updated);

    this.snackBar.open(
      'تم حفظ سعر الصرف وإعدادات العملة بنجاح / Exchange rate settings updated successfully',
      'إغلاق / Close',
      { duration: 4000, horizontalPosition: 'center', verticalPosition: 'bottom' }
    );
  }

  resetDefaults(): void {
    this.settingsForm.patchValue({
      usdExchangeRate: 50.0,
      defaultRegion: 'EG'
    });
    this.saveSettings();
  }

  getSimulatedUsd(egpAmount: number): string {
    const rate = parseFloat(this.settingsForm.get('usdExchangeRate')?.value) || 50.0;
    if (rate <= 0) return '0.00';
    const usd = egpAmount / rate;
    return usd.toFixed(2);
  }
}
