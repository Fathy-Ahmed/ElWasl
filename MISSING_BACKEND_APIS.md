# ElWasl — Missing Backend APIs Specification

This document details the missing backend API endpoints required to support the new frontend UI/UX updates (homepage sections, header options, author contracting pages, news feeds, and footers). These endpoints are not currently defined in the existing Swagger specification (`swagger_live.json`).

---

## 1. Community News & Events API (حدث من الدار)

Used to populate the **"حدث من الدار" (From the House)** news feed on the homepage and potential news pages.

### GET `/api/v1/News` (Public)
Gets a paginated list of news items.
- **Query Parameters**:
  - `pageNumber` (integer, default: 1)
  - `pageSize` (integer, default: 10)
- **Response** (`200 OK`):
  ```json
  {
    "items": [
      {
        "id": "string (guid)",
        "title": "string",
        "date": "string (formatted date or string, e.g., '15 يونيو 2026')",
        "desc": "string (short snippet description)",
        "content": "string (full HTML or markdown news content)",
        "imageUrl": "string (absolute URL to the banner image)",
        "createdAt": "string (ISO date)"
      }
    ],
    "totalCount": 0,
    "pageNumber": 1,
    "pageSize": 10
  }
  ```

### GET `/api/v1/News/{id}` (Public)
Gets the full details of a news article.
- **Response** (`200 OK`):
  ```json
  {
    "id": "string (guid)",
    "title": "string",
    "date": "string",
    "desc": "string",
    "content": "string",
    "imageUrl": "string",
    "createdAt": "string"
  }
  ```

### POST `/api/v1/admin/news` (Admin Only)
Creates a new news article.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body** (`application/json`):
  ```json
  {
    "title": "string (required)",
    "desc": "string (required)",
    "content": "string (required)",
    "imageUrl": "string (optional)"
  }
  ```
- **Response** (`201 Created`)

### PUT `/api/v1/admin/news/{id}` (Admin Only)
Updates an existing news article.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body** (`application/json`): Same as POST.
- **Response** (`200 OK` or `244 No Content`)

### DELETE `/api/v1/admin/news/{id}` (Admin Only)
Deletes a news article.
- **Headers**: `Authorization: Bearer <token>`
- **Response** (`204 NoContent`)

---

## 2. Exhibitions API (المعارض)

Required for the **"المعارض" (Exhibitions)** navigation options and current/upcoming exhibition spotlight panels.

### GET `/api/v1/Exhibitions` (Public)
Lists all book fairs and exhibitions.
- **Query Parameters**:
  - `isActiveOnly` (boolean, default: true)
- **Response** (`200 OK`):
  ```json
  {
    "items": [
      {
        "id": "string (guid)",
        "titleAr": "معرض القاهرة الدولي للكتاب ٢٠٢٦",
        "titleEn": "Cairo International Book Fair 2026",
        "dateAr": "٢٥ يناير - ٦ فبراير",
        "dateEn": "Jan 25 - Feb 06",
        "locationAr": "مركز مصر للمعارض الدولية",
        "locationEn": "Egypt International Exhibition Center",
        "descriptionAr": "جناح دار الوصل صالة 1 جناح B12.",
        "descriptionEn": "ElWasl stand: Hall 1 Stand B12.",
        "startDate": "2026-01-25T00:00:00Z",
        "endDate": "2026-02-06T00:00:00Z",
        "coverImage": "string (URL)"
      }
    ]
  }
  ```

### GET `/api/v1/Exhibitions/{id}` (Public)
Retrieve details of a single exhibition.
- **Response** (`200 OK`)

### POST `/api/v1/admin/exhibitions` (Admin Only)
- **Request Body** (`application/json`):
  ```json
  {
    "titleAr": "string",
    "titleEn": "string",
    "dateAr": "string",
    "dateEn": "string",
    "locationAr": "string",
    "locationEn": "string",
    "descriptionAr": "string",
    "descriptionEn": "string",
    "startDate": "string (ISO datetime)",
    "endDate": "string (ISO datetime)",
    "coverImage": "string"
  }
  ```
- **Response** (`201 Created`)

---

## 3. Promotions & Offers API (العروض)

Supports homepage dynamic offer banners and linking discounted items.

### GET `/api/v1/Promotions` (Public)
Gets active promotional campaigns and discount percentages.
- **Response** (`200 OK`):
  ```json
  [
    {
      "id": "string (guid)",
      "titleAr": "عروض الصيف الحارة",
      "titleEn": "Sizzling Summer Offers",
      "discountAr": "خصومات تصل إلى ٥٠٪ على الروايات",
      "discountEn": "Up to 50% discount on selected novels",
      "link": "string (e.g. '/offers')",
      "coverImage": "string (URL)",
      "isActive": true
    }
  ]
  ```

### GET `/api/v1/Promotions/{id}/products` (Public)
Gets products linked to a specific promotion.
- **Response** (`200 OK`): List of Products (with standard properties: title, price, discount price, cover).

---

## 4. Authors & Contracting API (المؤلفون وتعاقد معنا)

Powers the **"عائلة دار الوصل" (Our Authors)** statistics panel, profile grids, and the **"تعاقد معنا" (Publish/Contract with Us)** form upload.

### GET `/api/v1/Authors` (Public)
Lists profile details of Dar ElWasl's authors.
- **Response** (`200 OK`):
  ```json
  [
    {
      "name": "نجيب محفوظ",
      "photo": "string (URL)",
      "count": "42 رواية"
    }
  ]
  ```

### POST `/api/v1/AuthorContracting/request` (Public)
Submits a contracting request with manuscript attachment.
- **Request Format**: `multipart/form-data`
- **Form Fields**:
  - `authorName` (string, required)
  - `email` (string, required)
  - `phoneNumber` (string, required)
  - `bookTitle` (string, required)
  - `genre` (string, required)
  - `synopsis` (string, required)
  - `manuscriptFile` (binary file, required - PDF/Word docs)
- **Response** (`202 Accepted`):
  ```json
  {
    "requestId": "string (guid)",
    "status": "Pending",
    "message": "Manuscript received successfully. Our editors will review it."
  }
  ```

### GET `/api/v1/admin/author-contracting/requests` (Admin Only)
- **Response** (`200 OK`): Paginated listing of submissions.

---

## 5. Newsletter Subscription API (النشرة الإخبارية)

Populates the homepage **"اشترك في نشرتنا الإخبارية" (Subscribe to our newsletter)** form.

### POST `/api/v1/Newsletter/subscribe` (Public)
Subscribes an email to the newsletter.
- **Request Body** (`application/json`):
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response** (`200 OK` or `201 Created`):
  ```json
  {
    "success": true,
    "message": "Subscribed successfully."
  }
  ```

---

## 6. Contact Messages API (تواصل معنا)

Powers the **"تواصل معنا" (Contact Us)** form.

### POST `/api/v1/Contact` (Public)
Sends an inquiry/complaint suggestion to administration.
- **Request Body** (`application/json`):
  ```json
  {
    "name": "string (required)",
    "email": "string (required)",
    "subject": "string (required)",
    "message": "string (required)"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Message sent successfully."
  }
  ```

---

## 7. Bestsellers & Product Query Extensions

Adds query features for books, audiobooks, and games to filter by bestsellers or genre categories.

### GET `/api/v1/Books` (Extended Query Parameters)
Add parameter support to the existing books endpoint:
- `isBestseller` (boolean, optional) - filter only bestseller novels.
- `genre` (string, optional) - filter by genre category tags (e.g. 'خيال', 'دراما').
