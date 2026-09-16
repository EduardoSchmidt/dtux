import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

import {
  PoButtonModule,
  PoDisclaimerGroupModule,
  PoFieldModule,
  PoNotificationService,
  PoI18nPipe,
  PoPageModule,
  PoTableModule,
  PoDisclaimer
} from '@po-ui/ng-components';
import { BreadcrumbControlService, DisclaimerUtil, DownloadDataParams, FileUtil } from 'dts-backoffice-util';

import { BackofficeItem } from '../../../core/domain/entities/backoffice-item.entity';
import { SearchState } from '../../state/search-state';
import { createBackofficeItemColumns } from '../../shared/backoffice-item-columns';

@Component({
  selector: 'app-search-results',
  imports: [
    FormsModule,
    PoPageModule,
    PoFieldModule,
    PoButtonModule,
    PoTableModule,
    PoDisclaimerGroupModule
  ],
  providers: [PoI18nPipe],
  templateUrl: './search-results.html',
  styleUrl: './search-results.scss'
})
export class SearchResults {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly searchState = inject(SearchState);
  private readonly poNotification = inject(PoNotificationService);
  private readonly poI18nPipe = inject(PoI18nPipe);

  /** Serviços/utils da lib dts-backoffice-util. */
  protected readonly breadcrumbControl = inject(BreadcrumbControlService);
  private readonly disclaimerUtil = new DisclaimerUtil(this.poNotification, this.poI18nPipe, {
    termo: 'Busca'
  });

  private readonly termFromRoute = toSignal(
    this.activatedRoute.paramMap.pipe(map(params => params.get('termo') ?? '')),
    { initialValue: '' }
  );

  protected readonly refineTerm = signal('');
  protected readonly loading = this.searchState.loading;
  protected readonly results = this.searchState.results;
  protected readonly errorMessage = this.searchState.errorMessage;
  protected readonly isEmptyResult = this.searchState.isEmptyResult;
  protected readonly hasResults = computed(() => this.results().length > 0);

  protected readonly disclaimers = computed<PoDisclaimer[]>(() => {
    const term = this.termFromRoute();
    return term ? [this.disclaimerUtil.makeDisclaimer('termo', term)] : [];
  });

  protected readonly columns = createBackofficeItemColumns(item => this.openDetail(item));

  constructor() {
    // Sempre que o parâmetro de rota `:termo` mudar, atualiza breadcrumb + dispara a busca.
    effect(() => {
      const term = this.termFromRoute();
      this.refineTerm.set(term);
      this.searchState.search(term);
      this.breadcrumbControl.addBreadcrumb(`Resultados: "${term}"`, this.activatedRoute);
    });
  }

  onRefineSearch(): void {
    const term = this.refineTerm().trim();

    if (term && term !== this.termFromRoute()) {
      this.router.navigate(['/busca', term]);
    }
  }

  onDisclaimerRemoved(): void {
    this.router.navigate(['/']);
  }

  exportCsv(): void {
    const params = new DownloadDataParams();
    params.fileName = `resultados-backoffice-${this.termFromRoute() || 'todos'}.csv`;
    params.columnDelimiter = ';';
    params.columnList = ['code', 'name', 'category', 'responsible', 'status'];
    params.literals = {
      code: 'Código',
      name: 'Nome',
      category: 'Categoria',
      responsible: 'Responsável',
      status: 'Situação'
    };

    FileUtil.downloadData(this.results(), params);
  }

  private openDetail(item: BackofficeItem): void {
    this.router.navigate(['/item', item.id]);
  }
}
