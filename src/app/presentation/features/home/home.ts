import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  PoButtonModule,
  PoDividerModule,
  PoFieldModule,
  PoPageModule,
  PoTableModule
} from '@po-ui/ng-components';
import { BreadcrumbControlService } from 'dts-backoffice-util';

import { BackofficeItem } from '../../../core/domain/entities/backoffice-item.entity';
import { SearchState } from '../../state/search-state';
import { createBackofficeItemColumns } from '../../shared/backoffice-item-columns';

@Component({
  selector: 'app-home',
  imports: [FormsModule, PoPageModule, PoFieldModule, PoButtonModule, PoTableModule, PoDividerModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly searchState = inject(SearchState);

  /** BreadcrumbControlService vem da lib dts-backoffice-util. */
  protected readonly breadcrumbControl = inject(BreadcrumbControlService);

  protected readonly searchTerm = signal('');
  protected readonly loading = this.searchState.loading;
  protected readonly quickAccessItems = this.searchState.results;
  protected readonly errorMessage = this.searchState.errorMessage;
  protected readonly hasQuickAccessItems = computed(() => this.quickAccessItems().length > 0);

  protected readonly columns = createBackofficeItemColumns(item => this.openDetail(item));

  ngOnInit(): void {
    this.breadcrumbControl.newBreadcrumb();
    this.breadcrumbControl.addBreadcrumb('Início', this.activatedRoute);

    // Termo vazio: o repositório mock devolve a lista completa, usada como "acesso rápido".
    this.searchState.search('');
  }

  onSearch(): void {
    const term = this.searchTerm().trim();

    if (!term) {
      return;
    }

    // Ao buscar qualquer coisa, a aplicação navega para a tela de resultados.
    this.router.navigate(['/busca', term]);
  }

  private openDetail(item: BackofficeItem): void {
    this.router.navigate(['/item', item.id]);
  }
}
