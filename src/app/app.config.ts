import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { PoHttpRequestModule } from '@po-ui/ng-components';
import { BreadcrumbControlService } from 'dts-backoffice-util';

import { routes } from './app.routes';
import { BACKOFFICE_ITEM_REPOSITORY } from './core/domain/repositories/backoffice-item.repository';
import { MockBackofficeItemRepository } from './infrastructure/repositories/mock-backoffice-item.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(PoHttpRequestModule),
    provideHttpClient(withInterceptorsFromDi()),
    // BreadcrumbControlService (dts-backoffice-util) é @Injectable() SEM `providedIn: 'root'`,
    // por isso precisa ser registrado explicitamente aqui para poder ser injetado nas páginas.
    BreadcrumbControlService,
    // Clean Architecture: liga a porta do domínio (interface) à implementação de infraestrutura.
    // Troque por um repositório HTTP real quando a API do backoffice estiver disponível.
    { provide: BACKOFFICE_ITEM_REPOSITORY, useClass: MockBackofficeItemRepository }
  ]
};
