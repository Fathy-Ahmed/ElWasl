import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { 
  CreateOrderCommand, 
  OrderDto, 
  OrderDtoPaginatedList, 
  InitiatePaymentCommand, 
  LibraryItemDtoPaginatedList 
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly ordersUrl = `${API_CONFIG.baseUrl}/api/v1/Orders`;
  private readonly paymentsUrl = `${API_CONFIG.baseUrl}/api/v1/Payments`;
  private readonly entitlementsUrl = `${API_CONFIG.baseUrl}/api/v1/Entitlements`;

  createOrder(command: CreateOrderCommand): Observable<OrderDto> {
    return this.http.post<OrderDto>(this.ordersUrl, command);
  }

  getOrders(pageNumber = 1, pageSize = 20): Observable<OrderDtoPaginatedList> {
    return this.http.get<OrderDtoPaginatedList>(this.ordersUrl, {
      params: {
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString()
      }
    });
  }

  getOrderById(id: string): Observable<OrderDto> {
    return this.http.get<OrderDto>(`${this.ordersUrl}/${id}`);
  }

  initiatePayment(command: InitiatePaymentCommand): Observable<any> {
    return this.http.post<any>(`${this.paymentsUrl}/initiate`, command);
  }

  getEntitlements(pageNumber = 1, pageSize = 100): Observable<LibraryItemDtoPaginatedList> {
    return this.http.get<LibraryItemDtoPaginatedList>(this.entitlementsUrl, {
      params: {
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString()
      }
    });
  }
}
