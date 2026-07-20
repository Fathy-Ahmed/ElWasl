import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocaleService, Locale } from '../../../core/i18n/locale.service';

interface LanguageOption {
  code: Locale;
  label: string;
  nativeLabel: string;
  subLabel?: string;
  flag: string;
}

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lang-switcher-container" id="lang-switcher-wrapper">
      <button 
        type="button" 
        class="lang-btn" 
        (click)="toggleMenu($event)" 
        [class.open]="isOpen()"
        id="lang-switcher-btn"
        aria-haspopup="true"
        [attr.aria-expanded]="isOpen()">
        <span class="globe-icon">🌐</span>
        <span class="lang-label">{{ getLangLabel(currentLang()) }}</span>
        <span class="dropdown-chevron">▼</span>
      </button>

      @if (isOpen()) {
        <div class="lang-dropdown-menu" id="lang-dropdown-panel" role="menu">
          @for (lang of languages; track lang.code) {
            <button 
              type="button" 
              class="lang-option-btn" 
              [class.active]="currentLang() === lang.code"
              (click)="selectLanguage(lang.code, $event)"
              role="menuitem">
              <span class="lang-flag">{{ lang.flag }}</span>
              <div class="lang-text-group">
                <span class="native-name">{{ lang.nativeLabel }}</span>
                @if (lang.subLabel) {
                  <span class="sub-name">{{ lang.subLabel }}</span>
                }
              </div>
              @if (currentLang() === lang.code) {
                <span class="active-dot">✓</span>
              }
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .lang-switcher-container {
      position: relative;
      display: inline-block;
      user-select: none;
    }

    .lang-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 38px;
      padding: 0 14px;
      background: #FFFFFF;
      border: 1.5px solid rgba(212, 160, 23, 0.4);
      border-radius: 20px;
      color: #3E2723;
      font-weight: 700;
      font-size: 0.88rem;
      font-family: inherit;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
      transition: all 0.2s ease-in-out;

      &:hover {
        background: #FFF8E1;
        border-color: #F57C00;
        color: #E65100;
        box-shadow: 0 4px 12px rgba(245, 124, 0, 0.18);
        transform: translateY(-1px);
      }

      &.open {
        background: #FFF3E0;
        border-color: #F57C00;
        color: #E65100;

        .dropdown-chevron {
          transform: rotate(180deg);
        }
      }

      .globe-icon {
        font-size: 0.95rem;
        line-height: 1;
      }

      .lang-label {
        line-height: 1;
      }

      .dropdown-chevron {
        font-size: 0.65rem;
        transition: transform 0.25s ease;
        margin-inline-start: 2px;
        opacity: 0.8;
      }
    }

    .lang-dropdown-menu {
      position: absolute;
      top: calc(100% + 6px);
      inset-inline-end: 0;
      min-width: 175px;
      background: #FFFFFF;
      border: 1px solid rgba(212, 160, 23, 0.3);
      border-radius: 12px;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
      padding: 6px;
      z-index: 99999;
      animation: fadeInDown 0.2s ease-out;
      direction: inherit;
    }

    .lang-option-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      background: transparent;
      border: none;
      border-radius: 8px;
      color: #37474F;
      font-family: inherit;
      font-size: 0.9rem;
      cursor: pointer;
      text-align: start;
      transition: background 0.18s ease, color 0.18s ease;

      &:hover {
        background: #FFF3E0;
        color: #E65100;
      }

      &.active {
        background: rgba(245, 124, 0, 0.12);
        color: #E65100;
        font-weight: 700;
      }

      .lang-flag {
        font-size: 1.15rem;
        line-height: 1;
      }

      .lang-text-group {
        display: flex;
        flex-direction: column;
        flex: 1;
        line-height: 1.2;

        .native-name {
          font-weight: 700;
          font-size: 0.9rem;
        }

        .sub-name {
          font-size: 0.75rem;
          opacity: 0.7;
        }
      }

      .active-dot {
        font-weight: bold;
        color: #F57C00;
        font-size: 0.9rem;
      }
    }

    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class LanguageSwitcherComponent {
  private readonly localeService = inject(LocaleService);
  private readonly elementRef = inject(ElementRef);

  readonly currentLang = this.localeService.currentLocale;
  readonly isOpen = signal<boolean>(false);

  readonly languages: LanguageOption[] = [
    { code: 'ar', label: 'العربية', nativeLabel: 'العربية', subLabel: 'Arabic', flag: '🇦🇪' },
    { code: 'en', label: 'English', nativeLabel: 'English', subLabel: 'الإنجليزية', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', nativeLabel: 'Français', subLabel: 'الفرنسية', flag: '🇫🇷' }
  ];

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.isOpen.update(val => !val);
  }

  selectLanguage(code: Locale, event: Event): void {
    event.stopPropagation();
    this.localeService.setLanguage(code);
    this.isOpen.set(false);
  }

  getLangLabel(lang: Locale): string {
    const found = this.languages.find(l => l.code === lang);
    return found ? found.nativeLabel : 'Language';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
