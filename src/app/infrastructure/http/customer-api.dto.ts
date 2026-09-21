/**
 * Formato bruto retornado por `GET {baseUrl}/customer/{id}/get`.
 *
 * Como o contrato real da API ainda não foi confirmado, os nomes de campo abaixo são um
 * "melhor palpite" (padrão comum em APIs de cadastro). Ajuste esta interface (e o mapeamento
 * em `http-backoffice-item.repository.ts`) assim que tiver a resposta real do servidor —
 * é justamente para isolar esse tipo de mudança que a conversão DTO -> entidade de domínio
 * fica centralizada num único lugar (Clean Architecture).
 */
export interface CustomerApiDto {
  id?: string | number;
  code?: string;
  name?: string;
  category?: string;
  responsible?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}
