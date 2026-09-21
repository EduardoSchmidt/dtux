import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { PoHttpRequestModule } from '@po-ui/ng-components';
import { BreadcrumbControlService } from 'dts-backoffice-util';

import { AppRoutingModule } from './app-routing.module';
import { App } from './app';
import { BACKOFFICE_ITEM_REPOSITORY } from './core/domain/repositories/backoffice-item.repository';
import { HttpBackofficeItemRepository } from './infrastructure/repositories/http-backoffice-item.repository';
import { basicAuthInterceptor } from './infrastructure/http/basic-auth.interceptor';

@NgModule({
  declarations: [App],
  imports: [BrowserModule, AppRoutingModule, PoHttpRequestModule],
  providers: [
    provideHttpClient(withInterceptors([basicAuthInterceptor])),
    // BreadcrumbControlService (dts-backoffice-util) é @Injectable() SEM `providedIn: 'root'`,
    // por isso precisa ser registrado explicitamente aqui para poder ser injetado nas páginas.
    BreadcrumbControlService,
    // Clean Architecture: liga a porta do domínio (interface) à implementação de infraestrutura.
    // Hoje aponta para a chamada HTTP real (GET + Basic Auth); trocar a implementação aqui não
    // afeta domínio/aplicação/apresentação.
    { provide: BACKOFFICE_ITEM_REPOSITORY, useClass: HttpBackofficeItemRepository }
  ],
  bootstrap: [App]
})
export class AppModule {}
