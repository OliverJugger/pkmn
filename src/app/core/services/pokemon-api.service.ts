import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Card } from '../models/card.model';
import { PokemonSet } from '../models/set.model';
import { ApiResponse, ApiSingleResponse } from '../models/api-response.model';

export interface CardSearchParams {
  q?: string;
  page?: number;
  pageSize?: number;
  orderBy?: string;
  select?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PokemonApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getCards(params: CardSearchParams = {}): Observable<ApiResponse<Card>> {
    let httpParams = new HttpParams();
    if (params.q) httpParams = httpParams.set('q', params.q);
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
    if (params.orderBy) httpParams = httpParams.set('orderBy', params.orderBy);
    if (params.select) httpParams = httpParams.set('select', params.select);

    return this.http.get<ApiResponse<Card>>(`${this.baseUrl}/cards`, { params: httpParams });
  }

  getCard(id: string): Observable<ApiSingleResponse<Card>> {
    return this.http.get<ApiSingleResponse<Card>>(`${this.baseUrl}/cards/${id}`);
  }

  getSets(params: { orderBy?: string; select?: string } = {}): Observable<ApiResponse<PokemonSet>> {
    let httpParams = new HttpParams();
    if (params.orderBy) httpParams = httpParams.set('orderBy', params.orderBy);
    if (params.select) httpParams = httpParams.set('select', params.select);
    return this.http.get<ApiResponse<PokemonSet>>(`${this.baseUrl}/sets`, { params: httpParams });
  }

  getSet(id: string): Observable<ApiSingleResponse<PokemonSet>> {
    return this.http.get<ApiSingleResponse<PokemonSet>>(`${this.baseUrl}/sets/${id}`);
  }
}
