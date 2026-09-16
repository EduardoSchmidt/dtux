import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { BackofficeItem } from '../../domain/entities/backoffice-item.entity';
import { BACKOFFICE_ITEM_REPOSITORY } from '../../domain/repositories/backoffice-item.repository';

@Injectable({ providedIn: 'root' })
export class GetBackofficeItemByIdUseCase {
  private readonly repository = inject(BACKOFFICE_ITEM_REPOSITORY);

  execute(id: string): Observable<BackofficeItem | undefined> {
    return this.repository.getById(id);
  }
}
