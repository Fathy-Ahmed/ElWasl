import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';

export const routes: Routes = [

  {
    path: '',
    loadComponent: () => import('./features/home/home-page/home-page.component').then(m => m.HomePageComponent),
    title: 'الرئيسية | ElWasl'
  },
  {
    path: 'books',
    loadComponent: () => import('./features/catalog/book-list/book-list.component').then(m => m.BookListComponent),
    title: 'الكتب المطبوعة | ElWasl'
  },
  {
    path: 'books/:slug',
    loadComponent: () => import('./features/catalog/book-detail/book-detail.component').then(m => m.BookDetailComponent),
    title: 'تفاصيل الكتاب | ElWasl'
  },
  {
    path: 'audiobooks',
    loadComponent: () => import('./features/catalog/audiobook-list/audiobook-list.component').then(m => m.AudiobookListComponent),
    title: 'الكتب الصوتية | ElWasl'
  },
  {
    path: 'audiobooks/:slug',
    loadComponent: () => import('./features/catalog/audiobook-detail/audiobook-detail.component').then(m => m.AudiobookDetailComponent),
    title: 'تفاصيل الكتاب الصوتي | ElWasl'
  },
  {
    path: 'games',
    loadComponent: () => import('./features/games/game-list/game-list.component').then(m => m.GameListComponent),
    title: 'ألعاب الورق | ElWasl'
  },
  {
    path: 'games/:slug',
    loadComponent: () => import('./features/games/game-detail/game-detail.component').then(m => m.GameDetailComponent),
    title: 'تفاصيل اللعبة | ElWasl'
  },
  {
    path: 'exhibitions',
    loadComponent: () => import('./features/exhibitions/exhibition-list/exhibition-list.component').then(m => m.ExhibitionListComponent),
    title: 'المعارض | ElWasl'
  },
  {
    path: 'offers',
    loadComponent: () => import('./features/offers/offer-list/offer-list.component').then(m => m.OfferListComponent),
    title: 'العروض الخاصة | ElWasl'
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart-page/cart-page.component').then(m => m.CartPageComponent),
    title: 'عربة التسوق | ElWasl'
  },
  {
    path: 'library',
    loadComponent: () => import('./features/catalog/library/library.component').then(m => m.LibraryComponent),
    title: 'مكتبتي الخاصة | ElWasl'
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/checkout-page/checkout-page.component').then(m => m.CheckoutPageComponent),
    canActivate: [authGuard],
    title: 'إتمام الشراء | ElWasl'
  },
  {
    path: 'checkout/confirmation/:orderId',
    loadComponent: () => import('./features/checkout/order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent),
    title: 'تأكيد الطلب | ElWasl'
  },
  {
    path: 'account',
    redirectTo: 'account/profile',
    pathMatch: 'full'
  },
  {
    path: 'account/profile',
    loadComponent: () => import('./features/account/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
    title: 'حسابي | ElWasl'
  },
  {
    path: 'contract-with-us',
    loadComponent: () => import('./features/author-contracting/contract-terms/contract-terms.component').then(m => m.ContractTermsComponent),
    title: 'انشر معنا | ElWasl'
  },
  {
    path: 'contact-us',
    loadComponent: () => import('./features/contact-us/contact-form/contact-form.component').then(m => m.ContactFormComponent),
    title: 'اتصل بنا | ElWasl'
  },
  {
    path: 'about-us',
    loadComponent: () => import('./features/about-us/about-page/about-page.component').then(m => m.AboutPageComponent),
    title: 'من نحن | ElWasl'
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'تسجيل الدخول | ElWasl'
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    title: 'إنشاء حساب | ElWasl'
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
