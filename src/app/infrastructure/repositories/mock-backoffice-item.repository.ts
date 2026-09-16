import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import type { TotvsResponse } from 'dts-backoffice-util';

import { BackofficeItem } from '../../core/domain/entities/backoffice-item.entity';
import { IBackofficeItemRepository } from '../../core/domain/repositories/backoffice-item.repository';

/**
 * Implementação de infraestrutura da porta `IBackofficeItemRepository`.
 * Hoje simula uma API (delay + filtro em memória); amanhã pode virar um
 * `HttpClient` real sem que nenhuma linha das camadas de domínio/aplicação/
 * apresentação precise mudar — essa é a vantagem do Clean Architecture.
 *
 * O tipo `TotvsResponse<T>` vem da lib dts-backoffice-util e representa o
 * envelope padrão de resposta paginada usado nos serviços do backoffice
 * Datasul (`{ items, hasNext }`).
 */
@Injectable()
export class MockBackofficeItemRepository implements IBackofficeItemRepository {
  private readonly database: BackofficeItem[] = [
    this.item('1', 'BO-1001', 'Cadastro de Clientes', 'Cadastros', 'Maria Souza', 'ativo', -40, -2),
    this.item('2', 'BO-1002', 'Rotina de Faturamento', 'Financeiro', 'João Pedro', 'ativo', -120, -5),
    this.item('3', 'BO-1003', 'Conciliação Bancária', 'Financeiro', 'Ana Lima', 'pendente', -15, -1),
    this.item('4', 'BO-1004', 'Agendamento de Relatórios', 'Relatórios', 'Carlos Dias', 'ativo', -200, -30),
    this.item('5', 'BO-1005', 'Importação de NF-e', 'Fiscal', 'Beatriz Melo', 'inativo', -365, -180),
    this.item('6', 'BO-1006', 'Cadastro de Fornecedores', 'Cadastros', 'Rafael Alves', 'ativo', -70, -10),
    this.item('7', 'BO-1007', 'Gestão de Estoque', 'Logística', 'Fernanda Rocha', 'ativo', -30, -3),
    this.item('8', 'BO-1008', 'Apuração de Impostos', 'Fiscal', 'Diego Nunes', 'pendente', -8, -1),
    this.item('9', 'BO-1009', 'Emissão de Boletos', 'Financeiro', 'Patrícia Gomes', 'ativo', -95, -6),
    this.item('10', 'BO-1010', 'Integração EDI', 'Integrações', 'Lucas Prado', 'inativo', -400, -220),
    this.item('11', 'BO-1011', 'Cadastro de Colaboradores', 'RH', 'Camila Torres', 'ativo', -60, -4),
    this.item('12', 'BO-1012', 'Painel de Indicadores', 'Relatórios', 'Bruno Farias', 'ativo', -20, -1)
  ];

  search(term: string): Observable<BackofficeItem[]> {
    const normalizedTerm = (term ?? '').trim().toLowerCase();

    const items = normalizedTerm
      ? this.database.filter(item =>
          [item.code, item.name, item.category, item.responsible, item.status].some(field =>
            field.toLowerCase().includes(normalizedTerm)
          )
        )
      : this.database;

    const response: TotvsResponse<BackofficeItem> = { items, hasNext: false };

    // Simula latência de rede para exercitar os estados de loading (Signals) na UI.
    return of(response).pipe(
      delay(450),
      map(totvsResponse => totvsResponse.items)
    );
  }

  getById(id: string): Observable<BackofficeItem | undefined> {
    return of(this.database.find(item => item.id === id)).pipe(delay(300));
  }

  private item(
    id: string,
    code: string,
    name: string,
    category: string,
    responsible: string,
    status: BackofficeItem['status'],
    createdOffsetDays: number,
    updatedOffsetDays: number
  ): BackofficeItem {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    return {
      id,
      code,
      name,
      category,
      responsible,
      status,
      createdAt: new Date(now + createdOffsetDays * dayMs),
      updatedAt: new Date(now + updatedOffsetDays * dayMs)
    };
  }
}
