import { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '../../../environments/environment';

/**
 * Adiciona o header `Authorization: Basic <base64>` apenas nas requisições feitas para a
 * API do cliente (`environment.customerApi.baseUrl`), para não vazar a credencial para
 * outras chamadas (ex.: assets, outras APIs) que a aplicação venha a ter no futuro.
 */
export const basicAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const { baseUrl, auth } = environment.customerApi;

  if (!req.url.startsWith(baseUrl)) {
    return next(req);
  }

  const credentials = btoa(`${auth.username}:${auth.password}`);

  const authorizedRequest = req.clone({
    setHeaders: { Authorization: `Basic ${credentials}` }
  });

  return next(authorizedRequest);
};
