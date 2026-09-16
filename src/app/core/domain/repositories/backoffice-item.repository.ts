import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { BackofficeItem } from '../entities/backoffice-item.entity';

/**
 * Porta de saída do domínio (padrão "Repository" do Clean Architecture / DDD).
 * A camada de domínio e a de aplicação só conhecem esta interface.
 * Quem a implementa (mock, REST, GraphQL, etc.) fica em `infrastructure/`.
 */
export interface IBackofficeItemRepository {
  search(term: string): Observable<BackofficeItem[]>;
  getById(id: string): Observable<BackofficeItem | undefined>;
}

/**
 * Como interfaces TypeScript não existem em tempo de execução, usamos um
 * InjectionToken para permitir a inversão de dependência via Angular DI.
 * A ligação concreta acontece em `app.config.ts`.
 */
export const BACKOFFICE_ITEM_REPOSITORY = new InjectionToken<IBackofficeItemRepository>(
  'BACKOFFICE_ITEM_REPOSITORY'
);
