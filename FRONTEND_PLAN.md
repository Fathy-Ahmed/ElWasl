# ElWasl — Frontend Plan (Angular, AR/EN bilingual)

> Publishing house storefront: book/audiobook purchases, user accounts, exhibitions, offers, categorized novels, author contracting, contact form, about page, and card games — fully bilingual with RTL (Arabic) / LTR (English) support.

---

## 1. Angular Version & Core Setup

- **Angular 18+** (standalone components — no NgModules; current Angular best practice).
- **Strict mode** enabled (`strict: true` in `tsconfig.json`) from project creation.
- **State management**: Angular Signals for local/component state + a lightweight service-based store pattern for shared state (cart, auth, locale). Avoid NgRx unless the team is already comfortable with it — for this app's scope, signals + services is simpler and sufficient. (Flag if you'd prefer NgRx — happy to swap.)
- **Styling**: SCSS + a component library. Recommend **Angular Material** (mature RTL support, accessible) OR **PrimeNG** (more retail/e-commerce-styled components out of the box, also has RTL support). Either works — Angular Material is the safer default for RTL correctness.
- **HTTP**: Angular's `HttpClient` with functional interceptors (Angular 15+ style, not class-based).

---

## 2. Project Structure (Standalone, Feature-Based)

```
elwasl-frontend/
├── src/
│   ├── app/
│   │   ├── app.config.ts                 (providers: router, http, animations, translate)
│   │   ├── app.routes.ts                  (top-level lazy routes)
│   │   ├── app.component.ts               (root shell: header/footer/router-outlet)
│   │   │
│   │   ├── core/                          # singleton services, app-wide concerns
│   │   │   ├── auth/
│   │   │   │   ├── auth.service.ts        (login/register/refresh/logout, signal-based currentUser)
│   │   │   │   ├── auth.guard.ts          (functional CanActivateFn)
│   │   │   │   ├── admin.guard.ts
│   │   │   │   ├── token-refresh.interceptor.ts
│   │   │   │   └── models/auth.models.ts
│   │   │   ├── http/
│   │   │   │   ├── auth.interceptor.ts    (attach JWT)
│   │   │   │   ├── error.interceptor.ts   (global error → toast/notification)
│   │   │   │   └── api-base-url.token.ts
│   │   │   ├── i18n/
│   │   │   │   ├── locale.service.ts      (current lang signal, switch + persist + set dir)
│   │   │   │   └── locale.guard.ts        (optional: locale-prefixed routes)
│   │   │   ├── cart/
│   │   │   │   └── cart.service.ts        (signal-based cart state, persisted to localStorage)
│   │   │   ├── layout/
│   │   │   │   ├── header/
│   │   │   │   ├── footer/
│   │   │   │   └── nav/
│   │   │   └── models/
│   │   │       └── paginated-result.model.ts
│   │   │
│   │   ├── shared/                        # reusable, stateless, presentational
│   │   │   ├── components/
│   │   │   │   ├── product-card/
│   │   │   │   ├── price-tag/             (handles discount display)
│   │   │   │   ├── rating-stars/ (optional/future)
│   │   │   │   ├── loading-spinner/
│   │   │   │   ├── empty-state/
│   │   │   │   ├── confirm-dialog/
│   │   │   │   └── language-switcher/
│   │   │   ├── directives/
│   │   │   │   └── lazy-img.directive.ts
│   │   │   ├── pipes/
│   │   │   │   ├── localized-text.pipe.ts (pick TitleAr/TitleEn based on active locale)
│   │   │   │   └── currency-egp.pipe.ts
│   │   │   └── validators/
│   │   │       └── custom-validators.ts
│   │   │
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   ├── forgot-password/
│   │   │   │   └── auth.routes.ts
│   │   │   │
│   │   │   ├── catalog/                   # Books + Audiobooks + Categories
│   │   │   │   ├── book-list/
│   │   │   │   ├── book-detail/
│   │   │   │   ├── audiobook-list/
│   │   │   │   ├── audiobook-detail/
│   │   │   │   ├── category-list/
│   │   │   │   ├── category-detail/       (e.g. /categories/horror)
│   │   │   │   ├── data-access/
│   │   │   │   │   ├── book.service.ts
│   │   │   │   │   ├── audiobook.service.ts
│   │   │   │   │   ├── category.service.ts
│   │   │   │   │   └── models/
│   │   │   │   └── catalog.routes.ts
│   │   │   │
│   │   │   ├── games/
│   │   │   │   ├── game-list/
│   │   │   │   ├── game-detail/
│   │   │   │   ├── data-access/game.service.ts
│   │   │   │   └── games.routes.ts
│   │   │   │
│   │   │   ├── cart/
│   │   │   │   ├── cart-page/
│   │   │   │   └── cart.routes.ts
│   │   │   │
│   │   │   ├── checkout/
│   │   │   │   ├── checkout-page/
│   │   │   │   ├── payment-redirect/      (handles gateway return URL)
│   │   │   │   ├── order-confirmation/
│   │   │   │   ├── data-access/
│   │   │   │   │   ├── order.service.ts
│   │   │   │   │   └── payment.service.ts
│   │   │   │   └── checkout.routes.ts
│   │   │   │
│   │   │   ├── account/                   # "logged in user saves data for later"
│   │   │   │   ├── profile/
│   │   │   │   ├── order-history/
│   │   │   │   ├── my-library/            (purchased books/audiobooks/games — entitlements)
│   │   │   │   ├── addresses/
│   │   │   │   ├── data-access/
│   │   │   │   │   ├── user.service.ts
│   │   │   │   │   └── entitlement.service.ts
│   │   │   │   └── account.routes.ts
│   │   │   │
│   │   │   ├── exhibitions/
│   │   │   │   ├── exhibition-list/       (Current Exhibitions)
│   │   │   │   ├── exhibition-detail/
│   │   │   │   ├── data-access/exhibition.service.ts
│   │   │   │   └── exhibitions.routes.ts
│   │   │   │
│   │   │   ├── offers/
│   │   │   │   ├── offer-list/            (filterable: Summer/Novel/Winter)
│   │   │   │   ├── offer-detail/
│   │   │   │   ├── data-access/offer.service.ts
│   │   │   │   └── offers.routes.ts
│   │   │   │
│   │   │   ├── author-contracting/
│   │   │   │   ├── contract-terms/        ("Contract with Us" info page)
│   │   │   │   ├── contract-request-form/
│   │   │   │   ├── data-access/contract.service.ts
│   │   │   │   └── author-contracting.routes.ts
│   │   │   │
│   │   │   ├── contact-us/
│   │   │   │   ├── contact-form/
│   │   │   │   ├── data-access/contact.service.ts
│   │   │   │   └── contact-us.routes.ts
│   │   │   │
│   │   │   ├── about-us/
│   │   │   │   ├── about-page/
│   │   │   │   └── about-us.routes.ts
│   │   │   │
│   │   │   ├── home/
│   │   │   │   └── home-page/             (landing: featured offers, exhibitions, new arrivals)
│   │   │   │
│   │   │   └── admin/                     # separate lazy-loaded module, admin-guarded
│   │   │       ├── dashboard/
│   │   │       ├── books-management/
│   │   │       ├── audiobooks-management/
│   │   │       ├── games-management/
│   │   │       ├── orders-management/
│   │   │       ├── exhibitions-management/
│   │   │       ├── offers-management/
│   │   │       ├── contract-requests-management/
│   │   │       ├── contact-messages-management/
│   │   │       └── admin.routes.ts
│   │   │
│   │   └── app.routes.ts                  (assembles all feature routes, lazy-loaded)
│   │
│   ├── assets/
│   │   ├── i18n/
│   │   │   ├── ar.json
│   │   │   └── en.json
│   │   ├── images/
│   │   └── fonts/                         (Arabic-friendly font, e.g. Cairo/Tajawal + Latin pairing)
│   │
│   ├── environments/
│   │   ├── environment.ts
│   │   ├── environment.development.ts
│   │   └── environment.production.ts
│   │
│   ├── styles/
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   ├── _rtl.scss                      (logical-property overrides / dir-specific tweaks)
│   │   └── styles.scss                    (global entry)
│   │
│   ├── index.html
│   └── main.ts
│
├── angular.json
├── tsconfig.json
├── package.json
└── proxy.conf.json                        (dev proxy to backend API, avoids CORS friction locally)
```

---

## 3. Routing Plan (Top-Level)

```
/                              → Home
/books                         → Book list (filter by category, search)
/books/:slug                   → Book detail
/audiobooks                    → Audiobook list
/audiobooks/:slug              → Audiobook detail
/categories                    → All categories (Horror, Self-Help, ...)
/categories/:slug              → Books within a category
/games                         → Card games list
/games/:slug                   → Game detail
/exhibitions                   → Current Exhibitions
/exhibitions/:id               → Exhibition detail
/offers                        → All offers
/offers/:type                  → Filtered (summer | novel | winter)
/cart                          → Cart
/checkout                      → Checkout (guarded: requires auth or guest checkout decision)
/checkout/confirmation/:orderId
/account                       → redirects to /account/profile (guarded)
/account/profile               (guarded)
/account/orders                (guarded)
/account/library               (guarded) — purchased audiobooks/books access
/account/addresses              (guarded)
/contract-with-us              → Terms + request form
/contact-us                    → Contact form
/about-us                      → About page
/auth/login
/auth/register
/auth/forgot-password
/admin/**                      (admin-guarded, lazy-loaded as one chunk)
**                             → 404 page
```

All feature routes use `loadChildren` / `loadComponent` for lazy loading. Route titles set via Angular's `title` route property, localized.

---

## 4. Internationalization (Arabic / English + RTL)

Recommended approach: **`@angular/localize`** is heavier (build-time, separate bundles per locale). For a SPA where users **switch language at runtime** without reloading, use **ngx-translate** (`@ngx-translate/core`) instead — it's the better fit here since you want one build serving both languages dynamically.

### Setup
- `LocaleService` (in `core/i18n/`) holds active language as a signal (`'ar' | 'en'`), persists choice to `localStorage`, and:
  - Sets `<html dir="rtl|ltr" lang="ar|en">` dynamically on switch.
  - Triggers `ngx-translate`'s `use(lang)`.
- `assets/i18n/ar.json` / `en.json` hold all **UI strings** (buttons, labels, nav, validation messages, form labels).
- **Database-driven content** (book titles, descriptions, exhibition names, offer titles) is NOT in these JSON files — it comes from the API already containing both `*Ar`/`*En` fields or pre-localized by backend (see backend plan §7). A `localizedText` pipe/util picks the right field client-side if backend sends both.

### RTL Handling
- Use **CSS logical properties** everywhere instead of physical ones: `margin-inline-start` instead of `margin-left`, `padding-inline-end` instead of `padding-right`, `inset-inline-start` instead of `left`. This makes most layout automatically RTL-correct without duplicate stylesheets.
- For the few cases needing explicit overrides (icons that shouldn't mirror, e.g. a play button), use `[dir="rtl"]` attribute selectors in `_rtl.scss`.
- Angular Material (if chosen) respects `Directionality` from `@angular/cdk/bidi` — wrap app root or provide `DIR_DOCUMENT`/`Directionality` so Material components (dialogs, menus, drawers) flip automatically.
- Choose fonts that render Arabic well: **Cairo**, **Tajawal**, or **IBM Plex Sans Arabic** paired with a clean Latin font (or just use the Arabic font's Latin glyphs for consistency).
- Number formatting: Arabic locale users in Egypt commonly still prefer Western Arabic numerals (0-9) for prices — verify with the client, but default to standard digits unless told otherwise.
- Test every page in both directions early — RTL bugs (icon misalignment, overflow, carousel direction) compound if caught late.

### Language Switcher Component
- Simple toggle/dropdown in header (`shared/components/language-switcher`), persists to `localStorage`, calls `LocaleService.setLanguage()`.

---

## 5. Authentication & User Data Persistence

> "Each user logs in and saves their data for later use" → standard authenticated account with persisted state.

- **JWT stored in memory (signal) + refresh token flow**, NOT in `localStorage` for the access token (XSS risk) — use an `HttpOnly` cookie for the refresh token if backend supports it, or accept the access-token-in-memory + refresh-via-silent-call pattern.
  - Pragmatic alternative if cookie infra is more setup than you want for v1: access token in memory, refresh token in `localStorage`, with awareness this is a slightly weaker XSS posture — acceptable for v1, document it as a tech-debt item to revisit.
- `AuthService` exposes `currentUser` signal, `isAuthenticated` computed signal.
- Functional `authGuard` (CanActivateFn) protects `/account/**` and `/checkout`.
- `authInterceptor` attaches `Authorization: Bearer <token>` to outgoing requests targeting the API base URL.
- `tokenRefreshInterceptor` catches 401, attempts silent refresh once, retries original request, else redirects to `/auth/login?returnUrl=...`.
- Cart persists for **guests** in `localStorage`; on login, merge guest cart into the user's server-side cart (or keep cart entirely client-side/localStorage if you don't want a server cart table — simplest for v1: client-side cart, sent as `OrderItems` only at checkout time).

---

## 6. Key Feature Notes

### Purchases (Books, Audiobooks, Games)
- Unified `CartService` handles mixed cart (books + audiobooks + games) using a generic `CartItem { productType, productId, title, price, quantity, coverImage }`.
- `book-detail` / `audiobook-detail` / `game-detail` pages: "Add to Cart" + "Buy Now" actions.
- Audiobooks: detail page should clarify it's a **digital entitlement** (no physical shipping) — UI should differentiate digital vs physical items in cart/checkout (e.g., no address step needed if cart is digital-only).

### My Library (Entitlements)
- `account/my-library` shows purchased audiobooks/books the user can access — calls `entitlement.service.ts` → `GET /entitlements/my-library`. Since actual audio streaming/download isn't in scope yet, this page can show "owned" status and a placeholder ("available soon") for the actual playback/download action.

### Exhibitions
- Simple list + detail, likely public (no auth needed). Highlight "currently running" vs "past" using `StartDate`/`EndDate` from API — filter or visually badge "Currently Running."

### Offers
- Tabbed or filtered view by `OfferType` (Summer/Novel/Winter). Offer detail shows linked discounted products.

### Categories (Novel genres)
- `category-list` shows all categories with icons/images; `category-detail` reuses `book-list` component filtered by category slug — avoid duplicating the book grid component.

### Contract With Us
- Static/CMS content page (terms) + a form (`contract-request-form`) with file upload (manuscript attachment) — use a multipart form submission; show submission status clearly (Pending review).

### Contact Us
- Simple form: Type (Complaint/Suggestion/General), Subject, Message. Works for guests and logged-in users (pre-fill name/email if authenticated).

### About Us
- Static content page — could be hardcoded initially or fetched from a simple CMS-style API endpoint (backend plan includes this as a queryable entity for future editability via admin).

### Games
- Treated like a third product catalog alongside Books/Audiobooks — list/detail/cart/checkout reuse the same patterns. Filter by player count or tag (Friends/Family/Couples) on `game-list`.

---

## 7. Shared/Reusable Components Worth Building Early

- `product-card` — generic enough for Book, Audiobook, and Game (pass `productType` to vary CTA: "Buy" vs "Buy Audio" vs "Buy Game").
- `price-tag` — handles original vs discounted price display consistently (used across catalog + offers).
- `localized-text` pipe — `{{ item | localizedText:'title' }}` resolves to `titleAr`/`titleEn` based on current locale, reduces template branching.
- `language-switcher`, `loading-spinner`, `empty-state`, `confirm-dialog` (e.g., "Remove item from cart?").
- A `data-access` service convention per feature (`*.service.ts` calling typed API responses) keeps components presentation-focused — components should not call `HttpClient` directly.

---

## 8. API Integration Conventions

- One `environment.apiBaseUrl` per environment file; all services build off it.
- Strongly-typed request/response interfaces in each feature's `data-access/models/` mirroring backend DTOs.
- A generic `PaginatedResult<T>` model matching backend's paginated list shape (`items`, `totalCount`, `pageNumber`, `pageSize`).
- Centralized `error.interceptor.ts` catches HTTP errors, maps backend `ProblemDetails` responses to user-friendly toast notifications (respecting active locale for generic messages).
- Use Angular's `HttpResource`/`resource()` API (Angular 19 experimental) only if you upgrade past 18 and want it — otherwise standard `HttpClient` + RxJS `Observable` → converted to signals via `toSignal()` for template consumption is the safe, current-stable pattern.

---

## 9. Suggested NPM Packages

```
@angular/material  @angular/cdk        (UI components + RTL-aware bidi support)
@ngx-translate/core  @ngx-translate/http-loader   (runtime i18n)
ngx-toastr (or Material Snackbar)      (notifications)
ngx-mask (optional, phone/input formatting)
date-fns (lightweight date formatting/localization, has Arabic locale support)
```

Dev dependencies:
```
@angular-eslint/*
prettier + prettier-plugin-organize-imports
husky + lint-staged (pre-commit formatting/linting)
```

---

## 10. Step-by-Step Setup Order

1. `ng new elwasl-frontend --standalone --routing --style=scss --strict`
2. Set up folder skeleton (`core/`, `shared/`, `features/`) per structure above.
3. Install & configure `@ngx-translate` + `LocaleService`, wire up `dir`/`lang` attribute switching, build `ar.json`/`en.json` with initial nav/common strings.
4. Set up global SCSS: variables, logical-property mixins, RTL stylesheet, Arabic web font import.
5. Build `core/http` interceptors (auth, error) and `environment` files with `proxy.conf.json` pointing to local backend.
6. Build `auth` feature (login/register) end-to-end against backend Auth API — validates interceptors + guards.
7. Build `shared/components` (product-card, price-tag, language-switcher, loading-spinner) — needed by almost everything next.
8. Build `catalog` feature (categories → books → audiobooks) — read-only first, test localized rendering + RTL layout thoroughly here since it's the highest-traffic UI.
9. Build `cart` + `checkout` (the critical conversion path) — including payment redirect handling for Paymob/Stripe return URLs.
10. Build `account` (profile, order history, my-library, addresses).
11. Build `exhibitions`, `offers`, `games` (similar list/detail patterns, faster once catalog patterns are proven).
12. Build `author-contracting`, `contact-us`, `about-us` (lower complexity, content-driven).
13. Build `admin` module last, lazy-loaded, behind `adminGuard`.
14. Full bilingual + RTL QA pass across every page before launch.

---

## 11. Things to Decide Before/While Building

- **Component library**: confirm Angular Material vs PrimeNG vs fully custom — affects how much RTL work is "free" vs manual.
- **Guest checkout**: allowed, or must users register first? Affects checkout route guard and cart-merge logic.
- **Cart persistence**: purely client-side (`localStorage`) vs server-synced cart entity — recommend client-side for v1 simplicity.
- **SSR (Angular Universal)**: worth considering for SEO on public catalog/book pages (publishing houses benefit from book pages being indexable) — can be added later without major restructuring if you start standalone + lazy-loaded as planned.
- **Image handling**: confirm whether book covers/exhibition images are served from backend file storage or a CDN — affects the `lazy-img` directive and `environment` config now vs later.
