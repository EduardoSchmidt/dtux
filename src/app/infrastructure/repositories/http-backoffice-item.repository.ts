import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { BackofficeItem, BackofficeItemStatus } from '../../core/domain/entities/backoffice-item.entity';
import { IBackofficeItemRepository } from '../../core/domain/repositories/backoffice-item.repository';
import { CustomerApiDto } from '../http/customer-api.dto';

const VALID_STATUSES: ReadonlyArray<BackofficeItemStatus> = ['ativo', 'inativo', 'pendente'];

/**
 * Implementação de infraestrutura da porta `IBackofficeItemRepository` que consulta a API
 * local real via HTTP (autenticação Basic feita pelo `basicAuthInterceptor`).
 *
 * IMPORTANTE: o endereço fornecido (`{baseUrl}/customer/id/get`) é um endpoint de
 * "buscar cliente por id" — não existe (até onde sabemos) um endpoint de listagem/busca por
 * texto livre. Por isso:
 *   - `getById(id)` chama o endpoint real, substituindo o segmento `id` pelo valor informado;
 *   - `search(term)` reaproveita o mesmo endpoint tratando o termo digitado como o id do
 *     cliente a ser buscado (devolve uma lista com 0 ou 1 item).
 *
 * Se o backend expuser futuramente um endpoint de busca por texto livre, basta trocar a
 * implementação de `search` aqui — nada na camada de domínio/aplicação/apresentação muda.
 */
@Injectable()
export class HttpBackofficeItemRepository implements IBackofficeItemRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.customerApi.baseUrl;

  search(term: string): Observable<BackofficeItem[]> {
    const id = term.trim();

    if (!id) {
      return of([]);
    }

    return this.getById(id).pipe(map(item => (item ? [item] : [])));
  }

  getById(id: string): Observable<BackofficeItem | undefined> {
    const url = `${this.baseUrl}/customer/${encodeURIComponent(id)}/get`;

    return this.http.get<CustomerApiDto>(url).pipe(
      map(dto => this.toDomain(dto)),
      catchError(() => of(undefined))
    );
  }

  private toDomain(dto: CustomerApiDto): BackofficeItem {
    const rawStatus = (dto.status ?? '').toLowerCase();

    return {
      id: String(dto.id ?? ''),
      code: dto.code ?? '',
      name: dto.name ?? '',
      category: dto.category ?? '',
      responsible: dto.responsible ?? '',
      status: (VALID_STATUSES as string[]).includes(rawStatus) ? (rawStatus as BackofficeItemStatus) : 'pendente',
      createdAt: this.toDate(dto.createdAt),
      updatedAt: this.toDate(dto.updatedAt)
    };
  }

  private toDate(value: string | undefined): Date {
    const parsed = value ? new Date(value) : new Date();
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }
}
