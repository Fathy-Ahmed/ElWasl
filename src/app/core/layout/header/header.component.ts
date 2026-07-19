import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '../../../shared/components/language-switcher/language-switcher.component';
import { AuthService } from '../../auth/auth.service';
import { CartService } from '../../cart/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    LanguageSwitcherComponent
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  readonly cartService = inject(CartService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  isHomePage(): boolean {
    return this.router.url === '/' || this.router.url === '' || this.router.url.split('?')[0] === '/';
  }

  onSearchClick(): void {
    const heroSearch = document.getElementById('hero-search-input-field');
    if (heroSearch) {
      heroSearch.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => heroSearch.focus(), 400);
    } else {
      this.router.navigate(['/books']);
    }
  }
}
