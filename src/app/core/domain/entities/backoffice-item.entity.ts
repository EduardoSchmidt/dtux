/**
 * Entidade de domínio. Não conhece Angular, PO-UI, HTTP ou qualquer detalhe
 * de infraestrutura — é um contrato puro de negócio (regra do Clean Architecture:
 * o domínio não depende de nada externo).
 */
export type BackofficeItemStatus = 'ativo' | 'inativo' | 'pendente';

export interface BackofficeItem {
  id: string;
  code: string;
  name: string;
  category: string;
  responsible: string;
  status: BackofficeItemStatus;
  createdAt: Date;
  updatedAt: Date;
}
