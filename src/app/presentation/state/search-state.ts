import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, of, switchMap, tap } from 'rxjs';

import { BackofficeItem } from '../../core/domain/entities/backoffice-item.entity';
import { SearchBackofficeItemsUseCase } from '../../core/application/use-cases/search-backoffice-items.use-case';

/**
 * Ponte entre RxJS e Signals:
 *  - RxJS cuida do fluxo assíncrono de eventos (debounce, cancelamento da busca
 *    anterior via switchMap, tratamento de erro);
 *  - Signals expõem o resultado desse fluxo de forma síncrona e reativa para os
 *    templates, sem precisar de `async` pipe nem de assinaturas manuais.
 */
@Injectable({ providedIn: 'root' })
export class SearchState {
  private readonly searchUseCase = inject(SearchBackofficeItemsUseCase);

  private readonly termRequested$ = new Subject<string>();

  private readonly _loading = signal(false);
  private readonly _errorMessage = signal<string | null>(null);
  private readonly _term = signal('');

  readonly loading = this._loading.asReadonly();
  readonly errorMessage = this._errorMessage.asReadonly();
  readonly term = this._term.asReadonly();

  private readonly results$ = this.termRequested$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    tap(term => {
      this._term.set(term);
      this._loading.set(true);
      this._errorMessage.set(null);
    }),
    switchMap(term =>
      this.searchUseCase.execute(term).pipe(
        catchError(() => {
          this._errorMessage.set('Não foi possível concluir a busca. Tente novamente.');
          return of<BackofficeItem[]>([]);
        }),
        finalize(() => this._loading.set(false))
      )
    )
  );

  /** Signal derivado do Observable acima: sempre com o resultado mais recente da busca. */
  readonly results = toSignal(this.results$, { initialValue: [] as BackofficeItem[] });

  readonly hasResults = computed(() => this.results().length > 0);
  readonly isEmptyResult = computed(() => !this.loading() && this.results().length === 0 && this.term().length > 0);

  search(term: string): void {
    this.termRequested$.next((term ?? '').trim());
  }
}
