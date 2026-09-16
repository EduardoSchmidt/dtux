import { PoTableColumn } from '@po-ui/ng-components';

import { BackofficeItem } from '../../core/domain/entities/backoffice-item.entity';

/**
 * Definição das colunas do `po-table` usadas para exibir `BackofficeItem`.
 * Fica em `presentation/shared` porque é um detalhe de apresentação (PO-UI),
 * não deve vazar para `core` nem para `infrastructure`.
 *
 * A coluna `code` é do tipo `link`: clicar nela executa `onSelect`, que cada
 * tela usa para navegar (abrir outra tela) até o detalhe do item.
 */
export function createBackofficeItemColumns(onSelect: (item: BackofficeItem) => void): Array<PoTableColumn> {
  return [
    {
      property: 'code',
      label: 'Código',
      type: 'link',
      width: '110px',
      action: (_value: string, row: BackofficeItem) => onSelect(row)
    },
    { property: 'name', label: 'Nome', type: 'string' },
    { property: 'category', label: 'Categoria', type: 'string' },
    { property: 'responsible', label: 'Responsável', type: 'string' },
    {
      property: 'status',
      label: 'Situação',
      type: 'label',
      labels: [
        { value: 'ativo', color: 'color-11', label: 'Ativo' },
        { value: 'pendente', color: 'color-08', label: 'Pendente' },
        { value: 'inativo', color: 'color-07', label: 'Inativo' }
      ]
    },
    { property: 'updatedAt', label: 'Atualizado em', type: 'date', format: 'dd/MM/yyyy' }
  ];
}
