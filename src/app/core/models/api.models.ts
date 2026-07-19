export enum Language {
  Arabic = 1,
  English = 2
}

export enum BookFormat {
  Hardcover = 1,
  Paperback = 2,
  EBook = 3
}

export enum OrderStatus {
  Pending = 1,
  Paid = 2,
  Shipped = 3,
  Cancelled = 4,
  Refunded = 5
}

export enum PaymentProvider {
  Paymob = 1,
  Stripe = 2
}

export enum ProductType {
  Book = 1,
  Audiobook = 2,
  Game = 3
}

export interface ProblemDetails {
  type?: string | null;
  title?: string | null;
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
  [key: string]: any;
}

// Authentication Models
export interface AuthResponse {
  accessToken?: string | null;
  refreshToken?: string | null;
  email?: string | null;
  fullName?: string | null;
  role?: string | null;
}

export interface LoginUserCommand {
  email?: string | null;
  password?: string | null;
}

export interface RegisterUserCommand {
  email?: string | null;
  password?: string | null;
  fullName?: string | null;
  phoneNumber?: string | null;
  preferredLanguage?: Language;
}

export interface CurrentUserDto {
  id: string;
  email?: string | null;
  fullName?: string | null;
  role?: string | null;
  preferredLanguage?: string | null;
  phoneNumber?: string | null;
}

// Category Models
export interface CategoryDto {
  id: string;
  nameAr?: string | null;
  nameEn?: string | null;
  slug?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  parentCategoryId?: string | null;
}

export interface CreateCategoryCommand {
  nameAr?: string | null;
  nameEn?: string | null;
  slug?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  parentCategoryId?: string | null;
}

export interface UpdateCategoryCommand {
  id: string;
  nameAr?: string | null;
  nameEn?: string | null;
  slug?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  parentCategoryId?: string | null;
}

// Book Models (Public & Admin)
export interface BookDto {
  id: string;
  titleAr?: string | null;
  titleEn?: string | null;
  authorName?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  isbn?: string | null;
  coverImageUrl?: string | null;
  price: number;
  discountPrice?: number | null;
  priceUsd?: number | null;
  discountPriceUsd?: number | null;
  stock: number;
  categoryId: string;
  categoryNameAr?: string | null;
  categoryNameEn?: string | null;
  format?: string | null;
  language?: string | null;
  publishedDate?: string | null;
  isActive: boolean;
}

export interface BookDtoPaginatedList {
  items?: BookDto[] | null;
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreateBookCommand {
  titleAr?: string | null;
  titleEn?: string | null;
  authorName?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  isbn?: string | null;
  coverImageUrl?: string | null;
  price: number;
  discountPrice?: number | null;
  priceUsd?: number | null;
  discountPriceUsd?: number | null;
  stock: number;
  categoryId: string;
  format?: BookFormat;
  language?: Language;
  publishedDate?: string | null;
}

export interface UpdateBookCommand {
  id: string;
  titleAr?: string | null;
  titleEn?: string | null;
  authorName?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  isbn?: string | null;
  coverImageUrl?: string | null;
  price: number;
  discountPrice?: number | null;
  priceUsd?: number | null;
  discountPriceUsd?: number | null;
  stock: number;
  categoryId: string;
  format?: BookFormat;
  language?: Language;
  publishedDate?: string | null;
  isActive: boolean;
}

// Admin Book specific DTO
export interface AdminBookDto {
  id: string;
  titleAr?: string | null;
  titleEn?: string | null;
  authorName?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  isbn?: string | null;
  coverImageUrl?: string | null;
  price: number;
  discountPrice?: number | null;
  stock: number;
  categoryId: string;
  categoryName?: string | null;
  format?: string | null;
  language?: string | null;
  publishedDate?: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdBy?: string | null;
  createdAt: string;
  lastModifiedBy?: string | null;
  lastModifiedAt?: string | null;
}

export interface AdminBookDtoAdminPaginatedDto {
  items?: AdminBookDto[] | null;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// Audiobook Models
export interface AudiobookDto {
  id: string;
  bookId?: string | null;
  bookTitleAr?: string | null;
  bookTitleEn?: string | null;
  titleAr?: string | null;
  titleEn?: string | null;
  narratorName?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  coverImageUrl?: string | null;
  durationMinutes: number;
  price: number;
  priceUsd?: number | null;
  audioFileUrl?: string | null;
  isActive: boolean;
}

export interface AudiobookDtoPaginatedList {
  items?: AudiobookDto[] | null;
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreateAudiobookCommand {
  bookId?: string | null;
  titleAr?: string | null;
  titleEn?: string | null;
  narratorName?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  coverImageUrl?: string | null;
  durationMinutes: number;
  price: number;
  priceUsd?: number | null;
  audioFileUrl?: string | null;
}

export interface UpdateAudiobookCommand {
  id: string;
  bookId?: string | null;
  titleAr?: string | null;
  titleEn?: string | null;
  narratorName?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  coverImageUrl?: string | null;
  durationMinutes: number;
  price: number;
  priceUsd?: number | null;
  audioFileUrl?: string | null;
  isActive: boolean;
}

// Game Models
export interface GameDto {
  id: string;
  nameAr?: string | null;
  nameEn?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  price: number;
  priceUsd?: number | null;
  playerCountMin: number;
  playerCountMax: number;
  categoryTag?: string | null;
  imageUrl?: string | null;
  stock: number;
  isActive: boolean;
}

export interface GameDtoPaginatedList {
  items?: GameDto[] | null;
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreateGameCommand {
  nameAr?: string | null;
  nameEn?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  price: number;
  priceUsd?: number | null;
  playerCountMin: number;
  playerCountMax: number;
  categoryTag?: string | null;
  imageUrl?: string | null;
  stock: number;
}

export interface UpdateGameCommand {
  id: string;
  nameAr?: string | null;
  nameEn?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  price: number;
  priceUsd?: number | null;
  playerCountMin: number;
  playerCountMax: number;
  categoryTag?: string | null;
  imageUrl?: string | null;
  stock: number;
  isActive: boolean;
}

// Order & Checkout Models
export interface OrderItemRequest {
  productType: ProductType;
  productId: string;
  quantity: number;
}

export interface CreateOrderCommand {
  items?: OrderItemRequest[] | null;
  shippingAddressId?: string | null;
}

export interface OrderItemDto {
  id: string;
  productType: ProductType;
  productId: string;
  productTitleSnapshot?: string | null;
  unitPrice: number;
  quantity: number;
}

export interface OrderDto {
  id: string;
  orderNumber?: string | null;
  status?: string | null;
  totalAmount: number;
  shippingAddressId?: string | null;
  createdAt: string;
  orderItems?: OrderItemDto[] | null;
}

export interface OrderDtoPaginatedList {
  items?: OrderDto[] | null;
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface InitiatePaymentCommand {
  orderId: string;
  provider: PaymentProvider;
  successUrl?: string | null;
  cancelUrl?: string | null;
}

// Library Items (Owned content / Entitlements)
export interface LibraryItemDto {
  id: string;
  productType?: string | null;
  productId: string;
  titleAr?: string | null;
  titleEn?: string | null;
  narratorName?: string | null;
  coverImageUrl?: string | null;
  durationMinutes: number;
  audioFileUrl?: string | null;
  grantedAt: string;
}

export interface LibraryItemDtoPaginatedList {
  items?: LibraryItemDto[] | null;
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Admin Order specific DTOs
export interface AdminOrderDto {
  id: string;
  orderNumber?: string | null;
  userId: string;
  userEmail?: string | null;
  status: OrderStatus;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  paidAt?: string | null;
}

export interface AdminPaginatedOrderDto {
  items?: AdminOrderDto[] | null;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface UpdateOrderStatusRequest {
  newStatus: OrderStatus;
}

export interface RefundOrderRequest {
  refundReason?: string | null;
}
