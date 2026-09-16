import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { BackofficeItem } from '../../domain/entities/backoffice-item.entity';
import { BACKOFFICE_ITEM_REPOSITORY } from '../../domain/repositories/backoffice-item.repository';

/**
 * Caso de uso (camada de aplicação). Orquestra a regra de negócio da busca,
 * mas delega o "como buscar" para a porta do domínio (Repository).
 * A camada de apresentação (componentes) nunca fala direto com a infraestrutura.
 */
@Injectable({ providedIn: 'root' })
export class SearchBackofficeItemsUseCase {
  private readonly repository = inject(BACKOFFICE_ITEM_REPOSITORY);

  execute(term: string): Observable<BackofficeItem[]> {
    return this.repository.search(term);
  }
}
