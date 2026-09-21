/**
 * Ambiente de produção. Não importa de `./environment.ts` de propósito: o `fileReplacements`
 * do angular.json troca QUALQUER import de `environment.ts` por este arquivo durante o build de
 * produção — inclusive um import feito aqui dentro, o que causaria um import circular.
 *
 * Em produção, o ideal é que estes valores venham de variáveis de ambiente do processo de
 * build/deploy, e não fiquem hardcoded no repositório.
 */
export const environment = {
  production: true,
  customerApi: {
    baseUrl: 'https://10.1.150.30',
    auth: {
      username: 'CHANGE_ME_USERNAME',
      password: 'CHANGE_ME_PASSWORD'
    }
  }
};
