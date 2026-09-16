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
│   └── repositories/
│       └── mock-backoffice-item.repository.ts   # Implementação da porta (troque por HTTP real)
├── presentation/
│   ├── state/
│   │   └── search-state.ts           # RxJS (debounce/switchMap) -> Signals (toSignal)
│   ├── shared/
│   │   └── backoffice-item-columns.ts
│   └── features/
│       ├── home/                     # Busca + tabela de acesso rápido
│       ├── search-results/           # Tela aberta ao buscar (resultado + filtros + export)
│       └── item-detail/              # Detalhe do item (aberto ao clicar numa linha)
├── app.config.ts                     # Providers globais + ligação Domínio -> Infraestrutura
└── app.routes.ts
```

A regra de dependência do Clean Architecture é respeitada: `core/domain` não importa nada de
Angular específico de UI; `core/application` só conhece a porta do domínio; `infrastructure`
implementa essa porta; `presentation` só fala com casos de uso e com o estado (`SearchState`) —
nunca diretamente com o repositório mock. Trocar o mock por uma API REST real é alterar **apenas**
`infrastructure/repositories` e o provider em `app.config.ts`.

## RxJS + Signals

`presentation/state/search-state.ts` é o ponto central dessa combinação:

- Um `Subject<string>` recebe os termos de busca.
- RxJS cuida do fluxo assíncrono: `debounceTime`, `distinctUntilChanged`, `switchMap` (cancela a
  busca anterior automaticamente) e `catchError`.
- `toSignal(...)` transforma o resultado desse pipeline num **Signal**, consumido diretamente nos
  templates sem `async` pipe.
- Em `item-detail.ts` o caminho é o inverso: um Signal de rota (`id`) vira Observable via
  `toObservable`, alimenta um `switchMap` para buscar o item, e volta a virar Signal com
  `toSignal` — mostrando a ponte nos dois sentidos.

## Componentes do PO-UI já importados e em uso

- `PoPageModule` (`po-page-default`)
- `PoTableModule` (`po-table`, com coluna do tipo `link` para abrir o detalhe)
- `PoButtonModule` (`po-button`)
- `PoFieldModule` (`po-input`)
- `PoBreadcrumbModule` (consumido via `[p-breadcrumb]` do `po-page-default`)
- `PoDisclaimerGroupModule` (`po-disclaimer-group`, mostra o filtro de busca ativo)
- `PoDividerModule` (`po-divider`)
- `PoInfoModule` (`po-info`, tela de detalhe)

Os módulos do PO-UI usados por cada tela ficam declarados no array `imports` do próprio componente
standalone (`home.ts`, `search-results.ts`, `item-detail.ts`), padrão recomendado para Angular
standalone.

## Utils do dts-backoffice-util usados

| Util | Onde é usado | Para quê |
| --- | --- | --- |
| `BreadcrumbControlService` | `home.ts`, `search-results.ts`, `item-detail.ts` | Monta a trilha de breadcrumb (Início > Resultados > Item) consumida pelo `po-page-default` |
| `DisclaimerUtil` | `search-results.ts` | Gera o `po-disclaimer` do termo de busca ativo (`makeDisclaimer`) |
| `GenericFunctionsUtils` | `item-detail.ts` | `isEmpty` (estado "não encontrado") e `referenceGeneration` (gera uma referência interna a partir da data de criação) |
| `FileUtil` | `search-results.ts` | `downloadData` exporta os resultados da busca em CSV |
| `DownloadDataParams` | `search-results.ts` | Parâmetros do export (`fileName`, `columnList`, `literals`, `columnDelimiter`) |
| `DtsDateFormatPipe` (via `DtsBackofficeUtilsModule`) | `item-detail.html` | Formata `createdAt`/`updatedAt` (funciona com datas anteriores a 1901, ao contrário do `date` pipe nativo) |
| `TotvsResponse<T>` | `mock-backoffice-item.repository.ts` | Tipagem do envelope de resposta paginada padrão do backoffice Datasul |

### Duas armadilhas reais da lib, já contornadas neste projeto

1. **`BreadcrumbControlService` não tem `providedIn: 'root'`.** Ele é `@Injectable()` puro, então
   precisa ser registrado explicitamente — está em `app.config.ts` (`providers: [BreadcrumbControlService, ...]`).
   Sem isso, o Angular lança `NullInjectorError` no bootstrap e a tela fica em branco.
2. **`DtsDateFormatPipe` espera uma `string` `yyyy-MM-dd`, não um `Date`.** A implementação faz
   `value.split('-')` internamente. Por isso `item-detail.ts` converte `Date` para
   `yyyy-MM-dd` (`toIsoDate`) antes de passar pelo pipe no template.

## Fluxo de navegação (o que foi pedido)

1. **Home (`/`)** — campo de busca + tabela de "Acesso rápido" com os itens cadastrados.
2. Ao **buscar qualquer termo** (Enter ou botão "Buscar"), a aplicação **abre outra tela**:
   **Resultados da busca (`/busca/:termo`)**, com tabela filtrada, chip do filtro ativo
   (removível), refinamento da busca e exportação em CSV.
3. Clicar em qualquer código na tabela (Home ou Resultados) **abre o Detalhe do item
   (`/item/:id`)**.

## Notas / armadilhas do dts-backoffice-util encontradas durante a integração

- **`BreadcrumbControlService` não tem `providedIn: 'root'`** na lib (ao contrário de
  `UserLoginService`, `ProfileService` etc.). Por isso ele é registrado explicitamente em
  `app.config.ts` — sem isso, o Angular lança `NullInjectorError` no bootstrap e a tela fica em
  branco.
- **`DtsDateFormatPipe` espera uma `string` no formato `yyyy-MM-dd`**, não um objeto `Date` (o
  código da pipe faz `value.split('-')`). Por isso `item-detail.ts` converte `createdAt`/`updatedAt`
  para ISO (`toIsoDate`) antes de passar para o pipe no template.

## Próximos passos sugeridos

- Substituir `MockBackofficeItemRepository` por uma implementação HTTP real
  (`HttpClient` + endpoints do backoffice Datasul), sem tocar em domínio/aplicação/apresentação.
- Adicionar testes unitários para os *use cases* (são POJOs fáceis de testar, isolados do Angular).
- Avaliar `MenuDatasulService` e `TotvsScheduleExecutionComponent` do `dts-backoffice-util` caso o
  projeto precise se integrar ao menu/agendador do Datasul.
