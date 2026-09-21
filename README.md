# dts-backoffice-app

Projeto Angular criado do zero com [PO-UI](https://po-ui.io/) e a lib
[dts-backoffice-util](https://github.com/ModernizaDatasul/dts-backoffice-util), estruturado em
**Clean Architecture** e usando **RxJS + Signals** para o gerenciamento de estado.

> **Nota sobre versão:** o Angular 24 ainda não foi publicado (a versão estável mais recente no
> npm é a **21**, com a 22 em RC). O projeto foi montado com **Angular 21**, que já traz a API de
> Signals completa (`signal`, `computed`, `effect`, `toSignal`, `toObservable`) usada aqui, e é a
> versão suportada pelas versões mais recentes do `@po-ui/ng-components` (21.31.0) e do
> `dts-backoffice-util` (21.2.1).

## Como rodar

```bash
npm install
npm start        # ng serve -> http://localhost:4200
npm run build    # build de produção em dist/
```

Antes de testar a busca de verdade, ajuste `src/environments/environment.ts` (host da API e
usuário/senha do Basic Auth) — veja a seção [API real + Basic Auth](#api-real--basic-auth) abaixo.

## Bootstrap: NgModule clássico

A aplicação **não usa mais** `bootstrapApplication` (standalone). O bootstrap agora é o padrão
clássico com `NgModule`:

```ts
// src/main.ts
platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
```

- `src/app/app.module.ts` — `@NgModule` raiz: declara o componente `App`, importa
  `BrowserModule`, `AppRoutingModule` e `PoHttpRequestModule`, registra os providers globais
  (HTTP + interceptor de Basic Auth, `BreadcrumbControlService`, a ligação do repositório) e
  faz `bootstrap: [App]`.
- `src/app/app-routing.module.ts` — `RouterModule.forRoot(routes)`, reaproveitando o mesmo array
  de rotas de antes (`app.routes.ts`).
- `src/app/app.ts` — o componente raiz continua só com `<router-outlet />`, mas agora é
  `standalone: false` (precisa estar declarado no `AppModule` para poder ser usado no `bootstrap`).
- As **páginas** (`Landing`, `Home`, `SearchResults`, `ItemDetail`) continuam **standalone** e
  carregadas via `loadComponent` nas rotas — Angular permite misturar app "NgModule" com rotas
  lazy standalone sem problema, então nada precisou ser convertido nelas.

## Tela inicial em branco (Landing)

A rota `/` agora é uma tela em branco (`presentation/features/landing`), sem `po-page-default`,
sem breadcrumb — só um `po-button` centralizado ("Entrar"). Ao clicar, navega para `/portal`, que
é a tela principal que já existia (busca + `po-page-default`).

```
/            -> Landing (tela em branco + botão)
/portal      -> Home (busca por ID do cliente)
/busca/:id   -> SearchResults (resultado da busca, exportação, etc.)
/item/:id    -> ItemDetail (detalhe do cliente)
```

## API real + Basic Auth

**Não há mais dado de exemplo em memória.** O repositório agora faz uma chamada HTTP real:

```
GET {baseUrl}/customer/{id}/get
Authorization: Basic base64(usuario:senha)
```

- `src/environments/environment.ts` — `customerApi.baseUrl` (hoje `https://10.1.150.30`) e
  `customerApi.auth.username` / `customerApi.auth.password`. **Troque os valores `CHANGE_ME_*`**
  pelas credenciais reais antes de usar.
- `infrastructure/http/basic-auth.interceptor.ts` — `HttpInterceptorFn` que adiciona o header
  `Authorization: Basic ...` **somente** nas chamadas cujo `url` comece com `customerApi.baseUrl`
  (assim a credencial não vaza para outras chamadas que a app venha a ter).
- `infrastructure/http/customer-api.dto.ts` — formato bruto que a API devolve (`CustomerApiDto`).
  **Os nomes de campo são um palpite** (não temos o contrato real do backend); ajuste esta
  interface assim que souber o formato exato da resposta.
- `infrastructure/repositories/http-backoffice-item.repository.ts` — implementação real da porta
  `IBackofficeItemRepository`: converte `CustomerApiDto` -> `BackofficeItem` (entidade de domínio).

> ⚠️ **Sobre o endpoint fornecido** (`.../customer/id/get`): interpretei o segmento `id` como um
> placeholder de rota (`/customer/{id}/get`), ou seja, o repositório monta a URL trocando `{id}`
> pelo valor pesquisado. Se na verdade a URL é fixa (sempre literalmente `.../customer/id/get`,
> sem variar) ou o id vai por query string (`?id=...`), é só ajustar a montagem da URL dentro de
> `getById()` nesse arquivo — o resto da aplicação não muda.
>
> Também não existe (até onde sabemos) um endpoint de busca por texto livre — só "buscar por id".
> Por isso a tela de busca (`Home`/`SearchResults`) hoje trata o termo digitado como o **id do
> cliente**. Se depois existir um endpoint de busca de verdade, é só trocar a implementação de
> `search()` nesse mesmo arquivo.

> ⚠️ **Segurança:** usuário/senha fixos no `environment.ts` ficam visíveis no bundle JS enviado ao
> navegador (qualquer um pode abrir o DevTools e ler). Isso é aceitável só para desenvolvimento
> local. Para produção, o ideal é um backend/BFF que guarda a credencial e faz o proxy da chamada,
> ou trocar Basic Auth por token de curta duração.

> ⚠️ **HTTPS com IP e certificado próprio:** ao testar contra `https://10.1.150.30`, se o servidor
> usa certificado autoassinado, o navegador vai bloquear a chamada por padrão
> (`ERR_CERT_...`/`ERR_CERT_COMMON_NAME_INVALID`). É preciso confiar no certificado (importar no
> sistema/navegador) ou trocar por um certificado válido — isso é configuração de
> infraestrutura, não tem como contornar só no código do Angular.

## Arquitetura (Clean Architecture)

```
src/app/
├── core/
│   ├── domain/
│   │   ├── entities/                 # BackofficeItem (regra de negócio pura)
│   │   └── repositories/             # Porta IBackofficeItemRepository + InjectionToken
│   └── application/
│       └── use-cases/                # SearchBackofficeItemsUseCase, GetBackofficeItemByIdUseCase
├── infrastructure/
│   ├── http/
│   │   ├── basic-auth.interceptor.ts
│   │   └── customer-api.dto.ts
│   └── repositories/
│       └── http-backoffice-item.repository.ts   # Implementação real (GET + Basic Auth)
├── presentation/
│   ├── state/
│   │   └── search-state.ts           # RxJS (debounce/switchMap) -> Signals (toSignal)
│   ├── shared/
│   │   └── backoffice-item-columns.ts
│   └── features/
│       ├── landing/                  # Tela em branco + botão central
│       ├── home/                     # Busca por ID do cliente
│       ├── search-results/           # Tela aberta ao buscar (resultado + filtros + export)
│       └── item-detail/              # Detalhe do item (aberto ao clicar numa linha)
├── app.module.ts                     # NgModule raiz + providers globais
├── app-routing.module.ts             # RouterModule.forRoot(routes)
└── app.routes.ts
```

A regra de dependência do Clean Architecture é respeitada: `core/domain` não importa nada de
Angular específico de UI; `core/application` só conhece a porta do domínio; `infrastructure`
implementa essa porta (hoje via HTTP real); `presentation` só fala com casos de uso e com o
estado (`SearchState`) — nunca diretamente com `HttpClient`. Trocar a URL, o formato da resposta
ou até o tipo de autenticação é alterar **apenas** `infrastructure/`.

## RxJS + Signals

`presentation/state/search-state.ts` é o ponto central dessa combinação:

- Um `Subject<string>` recebe os termos de busca.
- RxJS cuida do fluxo assíncrono: `debounceTime`, `distinctUntilChanged`, `switchMap` (cancela a
  busca anterior automaticamente) e `catchError` (uma falha de rede vira lista vazia + mensagem de
  erro, sem quebrar a tela).
- `toSignal(...)` transforma o resultado desse pipeline num **Signal**, consumido diretamente nos
  templates sem `async` pipe.
- Em `item-detail.ts` o caminho é o inverso: um Signal de rota (`id`) vira Observable via
  `toObservable`, alimenta um `switchMap` para buscar o item, e volta a virar Signal com
  `toSignal` — mostrando a ponte nos dois sentidos.

## Componentes do PO-UI já importados e em uso

- `PoPageModule` (`po-page-default`)
- `PoTableModule` (`po-table`, com coluna do tipo `link` para abrir o detalhe)
- `PoButtonModule` (`po-button`, usado também na tela `Landing`)
- `PoFieldModule` (`po-input`)
- `PoBreadcrumbModule` (consumido via `[p-breadcrumb]` do `po-page-default`)
- `PoDisclaimerGroupModule` (`po-disclaimer-group`, mostra o filtro de busca ativo)
- `PoInfoModule` (`po-info`, tela de detalhe)

## Utils do dts-backoffice-util usados

| Util | Onde é usado | Para quê |
| --- | --- | --- |
| `BreadcrumbControlService` | `home.ts`, `search-results.ts`, `item-detail.ts` | Monta a trilha de breadcrumb (Início > Resultados > Item) consumida pelo `po-page-default` |
| `DisclaimerUtil` | `search-results.ts` | Gera o `po-disclaimer` do termo de busca ativo (`makeDisclaimer`) |
| `GenericFunctionsUtils` | `item-detail.ts` | `isEmpty` (estado "não encontrado") e `referenceGeneration` (gera uma referência interna a partir da data de criação) |
| `FileUtil` | `search-results.ts` | `downloadData` exporta os resultados da busca em CSV |
| `DownloadDataParams` | `search-results.ts` | Parâmetros do export (`fileName`, `columnList`, `literals`, `columnDelimiter`) |
| `DtsDateFormatPipe` (via `DtsBackofficeUtilsModule`) | `item-detail.html` | Formata `createdAt`/`updatedAt` |

### Armadilhas reais da lib, já contornadas neste projeto

1. **`BreadcrumbControlService` não tem `providedIn: 'root'`.** É `@Injectable()` puro, então
   precisa ser registrado explicitamente — está em `app.module.ts` (`providers: [BreadcrumbControlService, ...]`).
   Sem isso, o Angular lança `NullInjectorError` no bootstrap e a tela fica em branco.
2. **`DtsDateFormatPipe` espera uma `string` `yyyy-MM-dd`, não um `Date`.** A implementação faz
   `value.split('-')` internamente. Por isso `item-detail.ts` converte `Date` para
   `yyyy-MM-dd` (`toIsoDate`) antes de passar pelo pipe no template.

## Fluxo de navegação

1. **Landing (`/`)** — tela em branco com um botão central.
2. Clicar no botão abre **Home (`/portal`)** — campo de busca por ID do cliente.
3. Ao **buscar** (Enter ou botão "Buscar"), a aplicação **abre outra tela**: **Resultados da busca
   (`/busca/:id`)**, que chama a API real, mostra o resultado numa `po-table`, o filtro ativo como
   `po-disclaimer` (removível) e permite exportar em CSV.
4. Clicar no código na tabela de resultados **abre o Detalhe do item (`/item/:id`)**.

## Próximos passos sugeridos

- Confirmar com o backend o formato real da URL (`{id}` no path vs. query string) e da resposta
  JSON, e ajustar `http-backoffice-item.repository.ts` / `customer-api.dto.ts` de acordo.
- Trocar Basic Auth fixo no frontend por um fluxo mais seguro (proxy/BFF ou token de curta
  duração) antes de ir para produção.
- Adicionar testes unitários para os *use cases* (são POJOs fáceis de testar, isolados do Angular).
