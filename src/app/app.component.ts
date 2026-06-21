import { Component, inject, signal } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { FooterComponent } from './core/layout/footer/footer.component';
import { HeaderComponent } from './core/layout/header/header.component';
import { LocaleService } from './core/i18n/locale.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly localeService = inject(LocaleService);
  private readonly router = inject(Router);

  readonly isNotAdminRoute = signal<boolean>(true);

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isNotAdminRoute.set(!event.urlAfterRedirects.startsWith('/admin'));
      }
    });
  }
}

