/**
 * Configuração de ambiente (desenvolvimento).
 *
 * ATENÇÃO — SEGURANÇA:
 * Guardar usuário/senha aqui faz com que eles fiquem visíveis no bundle JS entregue ao
 * navegador (qualquer pessoa pode abrir o DevTools e ler o valor). Isso é aceitável apenas
 * para um ambiente de desenvolvimento/local fechado, como pedido. Para produção, o correto é:
 *   - Ter um backend/BFF que guarda a credencial e repassa a chamada (proxy), ou
 *   - Usar OAuth2/token de curta duração em vez de usuário/senha fixos, ou
 *   - Injetar as credenciais em tempo de build/deploy (variável de ambiente do servidor),
 *     nunca commitá-las no repositório.
 */
export const environment = {
  production: false,
  customerApi: {
    /**
     * Host da API local. Ajuste para o endereço real do seu servidor.
     * O endpoint final montado pelo repositório é: `${baseUrl}/customer/{id}/get`.
     */
    baseUrl: 'https://10.1.150.30',
    auth: {
      username: 'CHANGE_ME_USERNAME',
      password: 'CHANGE_ME_PASSWORD'
    }
  }
};
