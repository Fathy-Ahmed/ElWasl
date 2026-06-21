# ElWasl — Admin Dashboard Frontend Plan (Angular)

> Companion to `FRONTEND_PLAN.md`. Covers the `admin/` feature module sketched there, now fully detailed: layout, screens, components, charts, and state handling for managing the entire system from one Admin role.

---

## 1. Scope & Approach

- Lives **inside the existing Angular app**, as a single lazy-loaded feature: `features/admin/`, loaded via `loadChildren` only when an authenticated user with `role === 'Admin'` navigates to `/admin/**`. Confirmed per your decision — no separate app/build.
- Single **Admin role** — no permission-matrix UI needed for v1 (every logged-in Admin sees every screen). Still worth using a route-level `adminGuard` + a `hasAdminAccess()` check in the layout shell, so adding finer-grained role checks later only touches the guard, not every component.
- Distinct **admin shell layout** (sidebar nav + topbar) completely separate from the customer-facing header/footer — admin doesn't reuse the storefront chrome.
- Reuses from the base plan: `LocaleService` (admin UI is bilingual too — Egyptian staff will likely want Arabic), `authInterceptor`, `error.interceptor`, `PaginatedResult<T>` model, `localizedText` pipe.

---

## 2. Project Structure Addition

Extends `FRONTEND_PLAN.md` §2 — this fleshes out the `features/admin/` folder that was previously just stubbed:

```
src/app/features/admin/
├── admin.routes.ts                      (top-level admin lazy routes, all behind adminGuard)
├── admin-shell/
│   ├── admin-shell.component.ts         (sidebar + topbar + router-outlet wrapper)
│   ├── admin-sidebar/
│   │   └── admin-sidebar.component.ts   (nav links, collapsible groups, pending-action badges)
│   └── admin-topbar/
│       └── admin-topbar.component.ts    (search, language switcher, admin profile menu, logout)
│
├── dashboard/
│   ├── dashboard-page/
│   │   └── dashboard-page.component.ts  (assembles all widgets below)
│   ├── widgets/
│   │   ├── summary-cards/               (revenue, orders, new users, avg order value)
│   │   ├── sales-chart/                 (line/bar — sales-over-time)
│   │   ├── top-products-table/
│   │   ├── revenue-by-category-chart/   (pie/donut)
│   │   ├── revenue-by-product-type-chart/
│   │   ├── order-status-funnel/
│   │   ├── low-stock-alert-list/
│   │   └── pending-actions-panel/       (new contract requests / messages / orders)
│   └── data-access/
│       └── dashboard.service.ts
│
├── books-management/
│   ├── book-list-page/                  (admin table: search, filter, sort, pagination)
│   ├── book-form-page/                  (shared create/edit form, reactive forms)
│   ├── components/
│   │   └── book-cover-uploader/
│   └── data-access/admin-book.service.ts
│
├── audiobooks-management/
│   ├── audiobook-list-page/
│   ├── audiobook-form-page/
│   └── data-access/admin-audiobook.service.ts
│
├── games-management/
│   ├── game-list-page/
│   ├── game-form-page/
│   └── data-access/admin-game.service.ts
│
├── categories-management/
│   ├── category-list-page/
│   ├── category-form-dialog/            (simple enough for a modal, not full page)
│   └── data-access/admin-category.service.ts
│
├── orders-management/
│   ├── order-list-page/                 (filters: status, date range, product type, search)
│   ├── order-detail-page/               (items, customer, payment info, status timeline, actions)
│   ├── components/
│   │   ├── order-status-badge/
│   │   ├── order-status-update-dialog/
│   │   └── refund-confirm-dialog/
│   └── data-access/admin-order.service.ts
│
├── payments-management/
│   ├── payment-list-page/
│   ├── payment-detail-page/             (raw gateway payload viewer, for troubleshooting)
│   └── data-access/admin-payment.service.ts
│
├── users-management/
│   ├── user-list-page/
│   ├── user-detail-page/                (profile + orders + entitlements + messages, tabbed)
│   ├── components/
│   │   └── deactivate-user-dialog/
│   └── data-access/admin-user.service.ts
│
├── exhibitions-management/
│   ├── exhibition-list-page/
│   ├── exhibition-form-page/
│   └── data-access/admin-exhibition.service.ts
│
├── offers-management/
│   ├── offer-list-page/
│   ├── offer-form-page/
│   ├── components/
│   │   └── offer-product-picker/        (search & attach books/audiobooks/games to an offer)
│   └── data-access/admin-offer.service.ts
│
├── contract-requests-management/
│   ├── contract-request-list-page/
│   ├── contract-request-detail-page/    (manuscript info, status dropdown, admin notes)
│   └── data-access/admin-contract-request.service.ts
│
├── contact-messages-management/
│   ├── contact-message-list-page/
│   ├── contact-message-detail-page/     (thread view + reply box)
│   └── data-access/admin-contact-message.service.ts
│
├── content-management/
│   ├── about-us-editor-page/            (markdown editor, Ar/En tabs)
│   ├── contract-terms-editor-page/
│   └── data-access/admin-content.service.ts
│
├── audit-logs/
│   ├── audit-log-list-page/             (filter by entity type, action, admin, date)
│   └── data-access/admin-audit-log.service.ts
│
└── shared/                              (admin-only shared pieces, not in global shared/)
    ├── components/
    │   ├── admin-data-table/            (generic: sort, paginate, row actions — used everywhere)
    │   ├── admin-page-header/           (title + breadcrumb + primary action button)
    │   ├── status-badge/                (generic colored badge, configurable per status enum)
    │   ├── markdown-editor/             (wraps a simple MD editor lib, used by content-management)
    │   ├── stat-card/                   (used by dashboard summary-cards)
    │   └── chart-card-wrapper/          (consistent card chrome around all chart widgets)
    └── models/
        └── admin-query-params.model.ts (mirrors backend AdminQueryParams)
```

---

## 3. Routing Plan (Admin)

```
/admin                                   → redirect to /admin/dashboard
/admin/dashboard

/admin/books                             → list
/admin/books/new                         → create form
/admin/books/:id/edit                    → edit form

/admin/audiobooks                        → list
/admin/audiobooks/new
/admin/audiobooks/:id/edit

/admin/games                             → list
/admin/games/new
/admin/games/:id/edit

/admin/categories                        → list (+ create/edit via dialog, no separate route needed)

/admin/orders                            → list
/admin/orders/:id                        → detail

/admin/payments                          → list
/admin/payments/:id                      → detail

/admin/users                             → list
/admin/users/:id                         → detail

/admin/exhibitions                       → list
/admin/exhibitions/new
/admin/exhibitions/:id/edit

/admin/offers                            → list
/admin/offers/new
/admin/offers/:id/edit

/admin/contract-requests                 → list
/admin/contract-requests/:id             → detail

/admin/contact-messages                  → list
/admin/contact-messages/:id              → detail (thread + reply)

/admin/content/about-us                  → editor
/admin/content/contract-terms            → editor

/admin/audit-logs                        → list
```

All routes load under `admin.routes.ts`, itself lazy-loaded from `app.routes.ts` as a single chunk:

```ts
{
  path: 'admin',
  canActivate: [adminGuard],
  loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
}
```

`adminGuard` checks `authService.currentUser()?.role === 'Admin'`; redirects non-admins to `/` (not to login — they may already be logged in as a regular customer).

---

## 4. Admin Shell Layout

- **Sidebar**: collapsible, grouped nav — `Dashboard`, `Catalog (Books/Audiobooks/Games/Categories)`, `Orders & Payments`, `Users`, `Marketing (Exhibitions/Offers)`, `Author Contracting`, `Contact Messages`, `Content`, `Audit Logs`. Badge counts on `Orders`, `Contract Requests`, `Contact Messages` sourced from `GetPendingActionsCount` (polled or refreshed on navigation, not real-time websockets for v1).
- **Topbar**: global search (optional v1.1 — search across books/orders/users by keyword), language switcher (reuses `shared/components/language-switcher`), admin profile dropdown (name, logout).
- **RTL**: admin shell must mirror correctly too — sidebar flips to the right in Arabic. Reuse the same logical-properties CSS approach from the base frontend plan; don't special-case admin styling for RTL separately.
- Layout uses CSS Grid: `sidebar | main-content`, with `main-content` containing `admin-page-header` + routed page content consistently across all screens.

---

## 5. Core Reusable Admin Components

### `admin-data-table` (the workhorse component)
Generic, configuration-driven table used by every `*-list-page`:
- Inputs: `columns` (key, label, type: text/badge/date/currency/image), `data` (signal or input), `loading`, `totalCount`, `pageSize`, `pageIndex`.
- Outputs: `pageChange`, `sortChange`, `rowAction` (edit/delete/view click).
- Built once, configured per-feature — avoids rebuilding table markup/pagination/sorting logic 12 times across all management screens.
- Pairs with a `filterBar` pattern (each list page defines its own filter form, emits filter changes to its `data-access` service).

### `stat-card` + `chart-card-wrapper`
- `stat-card`: big number + label + trend indicator (↑/↓ % vs previous period) — used for the 4 dashboard summary cards.
- `chart-card-wrapper`: consistent title/card chrome wrapping each chart widget so the dashboard grid looks cohesive regardless of which charting library renders inside.

### `status-badge`
- Generic colored pill, takes a `status` string + a `statusColorMap` config per entity (Order statuses get one color set, ContactMessage statuses another) — one component, many configs, instead of duplicating badge styling per feature.

### `markdown-editor`
- Lightweight wrapper around a markdown editor library (e.g., `ngx-markdown` for rendering + a simple textarea-with-preview, or `easymde`/`ngx-easymde` for a richer WYSIWYG-ish experience) — used only by `content-management` (About Us, Contract Terms). Keep it simple; this isn't a general-purpose CMS.

---

## 6. Charts — Library Choice

Recommend **ngx-charts** or **Chart.js via `ng2-charts`** for the dashboard. Either is fine; suggest **Chart.js/ng2-charts** specifically because:
- Smaller footprint, very well documented, broad chart-type support (line, bar, doughnut/pie — covers every widget in §2).
- Good enough RTL/i18n behavior for axis labels and legends with minor config (numbers stay LTR even in Arabic UI, which is standard practice and matches the numerals decision from the base plan).

Chart widgets needed:
| Widget | Chart type |
|---|---|
| `sales-chart` | Line (or bar) — revenue/orders over time |
| `revenue-by-category-chart` | Doughnut/pie |
| `revenue-by-product-type-chart` | Doughnut/pie or stacked bar |
| `order-status-funnel` | Horizontal bar (simplest reliable way to show a funnel-like breakdown without a specialized funnel-chart library) |

---

## 7. Forms — Conventions

- All create/edit forms (`book-form-page`, `exhibition-form-page`, `offer-form-page`, etc.) use **Angular Reactive Forms** with `FormGroup`/`FormBuilder`, not template-driven — needed for the validation complexity and the bilingual field pairs.
- **Bilingual field pattern**: every translatable field (Title, Description) renders as a **tabbed AR/EN pair** within the same form (e.g., a small "AR | EN" tab toggle above the relevant fields) rather than two separate forms — keeps the admin's mental model of "one book, two languages" intact.
- Shared `custom-validators.ts` (from base plan) extended with admin-specific rules where needed (e.g., price must be positive, stock must be non-negative integer).
- Image/file uploads (`book-cover-uploader`, manuscript attachments viewer on contract requests) use a simple drag-and-drop or file-input component posting `multipart/form-data` to the relevant admin endpoint, with a preview before submit.
- Unsaved-changes guard (`CanDeactivate`) on form pages — warns admin if they navigate away with unsaved edits. Small thing, prevents real data-entry frustration.

---

## 8. State & Data Access Conventions

- Every `*-management` feature gets its own `data-access/admin-*.service.ts` calling the corresponding backend `/admin/**` endpoints — mirrors the public `data-access` pattern from the base plan, kept entirely separate (admin services never reused by customer-facing components, and vice versa, to avoid coupling admin-only DTOs into the public bundle).
- List pages hold filter/pagination state as **signals** (`currentPage`, `pageSize`, `filters`), recompute an `effect()` or call the service on change — consistent with the signals-first approach from the base plan, no NgRx needed here either given single-admin-role scope.
- `dashboard.service.ts` fetches each widget's data independently (separate HTTP calls per widget, not one giant aggregate call) so slow widgets (e.g., `top-products`) don't block fast ones (`summary-cards`) from rendering — each widget manages its own loading state.

---

## 9. Suggested Additional NPM Packages

```
ng2-charts  chart.js              (dashboard charts)
ngx-markdown  (or easymde + a thin Angular wrapper)   (content editor)
@angular/cdk/drag-drop            (optional — reordering categories/offer products if needed)
```

(Everything else — Angular Material/PrimeNG, ngx-translate, toastr — already covered by `FRONTEND_PLAN.md` §9 and shared across customer + admin.)

---

## 10. Step-by-Step Build Order (Admin Frontend)

1. Build `admin-shell` (sidebar + topbar) and `adminGuard` first — establishes the chrome everything else renders inside.
2. Build `admin-data-table`, `admin-page-header`, `status-badge`, `stat-card` — the reusable primitives every later screen depends on.
3. Build **Catalog management** (Books → Audiobooks → Games → Categories) — proves out the list/create/edit pattern end-to-end, including the bilingual form-tab pattern and image upload.
4. Build **Orders & Payments management** — highest business value; includes the status-update dialog and refund confirmation flow (test thoroughly against backend's order state machine).
5. Build **Users management**.
6. Build **Exhibitions, Offers, Author Contracting, Contact Messages, Content** management — same list/detail/form patterns, faster now that primitives exist. Offers needs the extra `offer-product-picker` component.
7. Build **Audit Logs** list (simple, read-only, lowest priority).
8. Build the **Dashboard** last, once real backend aggregate endpoints + seeded demo data exist to validate charts against — wire up `ng2-charts`, build each widget against `dashboard.service.ts`.
9. Full bilingual + RTL QA pass on the entire admin module (forms, tables, charts, sidebar) — charts especially need a second look in RTL (legend position, tooltip alignment).

---

## 11. Things to Decide Before/While Building

- **Admin "create new admin user"**: is admin user creation done via this dashboard (a `users-management` action to promote a user to Admin role), or handled manually/via seed/DB for now? Recommend manual for v1 given single-role scope — adding a UI for this is low priority until you have more than one admin.
- **Bulk actions**: do list pages need bulk operations (e.g., select multiple books → deactivate)? Not in the backend plan yet — flag if needed, it's a small addition to both `admin-data-table` and the relevant backend endpoints.
- **Notification delivery for pending actions**: badge counts in sidebar are pull-based (refetch on nav/interval) for v1 — real-time (SignalR) is possible later but adds real complexity; confirm pull-based is acceptable for launch.
- **Export functionality**: do you need CSV/Excel export for orders or users (common admin ask)? Not currently planned — easy to add to `admin-data-table` as a generic "export current view" action if needed.
