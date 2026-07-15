import { Routes } from '@angular/router';
import { AdminShellComponent } from './admin-shell/admin-shell.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminShellComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard-page/dashboard-page.component').then(m => m.DashboardPageComponent)
      },
      {
        path: 'books',
        loadComponent: () => import('./books-management/book-list-page/book-list-page.component').then(m => m.BookListPageComponent)
      },
      {
        path: 'audiobooks',
        loadComponent: () => import('./audiobooks-management/audiobook-list-page/audiobook-list-page.component').then(m => m.AudiobookListPageComponent)
      },
      {
        path: 'games',
        loadComponent: () => import('./games-management/game-list-page/game-list-page.component').then(m => m.GameListPageComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./categories-management/category-list-page/category-list-page.component').then(m => m.CategoryListPageComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./orders-management/order-list-page/order-list-page.component').then(m => m.OrderListPageComponent)
      },
      {
        path: 'payments',
        loadComponent: () => import('./payments-management/payment-list-page/payment-list-page.component').then(m => m.PaymentListPageComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./users-management/user-list-page/user-list-page.component').then(m => m.UserListPageComponent)
      },
      {
        path: 'exhibitions',
        loadComponent: () => import('./exhibitions-management/exhibition-list-page/exhibition-list-page.component').then(m => m.ExhibitionListPageComponent)
      },
      {
        path: 'offers',
        loadComponent: () => import('./offers-management/offer-list-page/offer-list-page.component').then(m => m.OfferListPageComponent)
      },
      {
        path: 'contract-requests',
        loadComponent: () => import('./contract-requests-management/contract-request-list-page/contract-request-list-page.component').then(m => m.ContractRequestListPageComponent)
      },
      {
        path: 'contact-messages',
        loadComponent: () => import('./contact-messages-management/contact-message-list-page/contact-message-list-page.component').then(m => m.ContactMessageListPageComponent)
      },
      {
        path: 'content/about-us',
        loadComponent: () => import('./content-management/about-us-editor-page/about-us-editor-page.component').then(m => m.AboutUsEditorPageComponent)
      },
      {
        path: 'content/contract-terms',
        loadComponent: () => import('./content-management/contract-terms-editor-page/contract-terms-editor-page.component').then(m => m.ContractTermsEditorPageComponent)
      },
      {
        path: 'content/homepage',
        loadComponent: () => import('./content-management/homepage-editor-page/homepage-editor-page.component').then(m => m.HomepageEditorPageComponent)
      },
      {
        path: 'audit-logs',
        loadComponent: () => import('./audit-logs/audit-log-list-page/audit-log-list-page.component').then(m => m.AuditLogListPageComponent)
      }
    ]
  }
];
