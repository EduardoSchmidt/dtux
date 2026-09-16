import { Component, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap, tap } from 'rxjs';

import { PoButtonModule, PoInfoModule, PoPageModule } from '@po-ui/ng-components';
import { BreadcrumbControlService, DtsBackofficeUtilsModule, GenericFunctionsUtils } from 'dts-backoffice-util';

import { GetBackofficeItemByIdUseCase } from '../../../core/application/use-cases/get-backoffice-item-by-id.use-case';

@Component({
  selector: 'app-item-detail',
  // DtsBackofficeUtilsModule é o NgModule da lib dts-backoffice-util que exporta a pipe `dtsDateFormat`.
  imports: [PoPageModule, PoInfoModule, PoButtonModule, DtsBackofficeUtilsModule],
  templateUrl: './item-detail.html',
  styleUrl: './item-detail.scss'
})
export class ItemDetail {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly getByIdUseCase = inject(GetBackofficeItemByIdUseCase);

  protected readonly breadcrumbControl = inject(BreadcrumbControlService);
  private readonly genericFunctionsUtils = new GenericFunctionsUtils({});

  private readonly _loading = signal(true);
  protected readonly loading = this._loading.asReadonly();

  private readonly id = toSignal(
    this.activatedRoute.paramMap.pipe(map(params => params.get('id') ?? '')),
    { initialValue: '' }
  );

  /** Signal -> Observable -> Signal: busca reage a mudanças de `id` via RxJS e o resultado volta a ser um Signal. */
  protected readonly item = toSignal(
    toObservable(this.id).pipe(
      tap(() => this._loading.set(true)),
      switchMap(id => this.getByIdUseCase.execute(id)),
      tap(() => this._loading.set(false))
    ),
    { initialValue: undefined }
  );

  protected readonly notFound = computed(() => !this.loading() && GenericFunctionsUtils.isEmpty(this.item() ?? {}));

  /** Demonstra o uso de `GenericFunctionsUtils.referenceGeneration` (instância) da lib dts-backoffice-util. */
  protected readonly internalReference = computed(() => {
    const current = this.item();
    return current ? this.genericFunctionsUtils.referenceGeneration('I', current.createdAt) : '';
  });

  /**
   * `DtsDateFormatPipe` (dts-backoffice-util) espera uma string `yyyy-MM-dd` (faz `value.split('-')`
   * internamente) e não um objeto `Date` — por isso convertemos antes de usar no template.
   */
  protected readonly createdAtIso = computed(() => this.toIsoDate(this.item()?.createdAt));
  protected readonly updatedAtIso = computed(() => this.toIsoDate(this.item()?.updatedAt));

  constructor() {
    effect(() => {
      const current = this.item();
      const label = current ? `Item: ${current.code}` : 'Detalhe do item';
      this.breadcrumbControl.addBreadcrumb(label, this.activatedRoute);
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  private toIsoDate(date: Date | undefined): string {
    return date ? date.toISOString().slice(0, 10) : '';
  }
}
