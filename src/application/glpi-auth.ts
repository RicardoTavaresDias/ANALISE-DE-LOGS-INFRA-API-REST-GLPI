import { GlpiSession } from "./glpi-session"
import { User } from "./interface/ICredentials"
import { AppError } from "@/utils/AppError"
import { Http } from "@/utils/Http"

/**
 * Classe responsável por realizar autenticação no GLPI.
 *
 * - Cria sessão com `initSession`.
 * - Salva o token da sessão no `GlpiSession`.
 * - Busca e vincula dados do usuário autenticado.
 */

export class GlpiAuth {

    /**
   * Responsável pela autenticação no GLPI e vinculação do usuário à sessão.
   * @param {GlpiSession} session - Instância do navegador com credenciais e sessão.
   */

  constructor (private session: GlpiSession) {}

   /**
   * Realiza login no GLPI.
   *
   * - Cria uma sessão via `initSession`.
   * - Armazena o token da sessão no `GlpiBrowser`.
   * - Busca e vincula os dados do usuário autenticado.
   * - Em caso de erro, lança uma instância de `AppError`.
   *
   * @async
   * @throws {AppError} Caso o GLPI retorne erro na autenticação.
   * @returns {Promise<void>} Promessa resolvida após o login ser concluído.
   */

  public async login (): Promise<void> {
    const http = new Http(this.session.getSessionToken())
    const response = await http.request({
      endpoint: '/initSession',
      method: 'POST',
      content: {
        login: this.session.credentials.user,
        password: this.session.credentials.password,
        auth: "ldap-22"
      }
    })

    if (Array.isArray(response)) {
      throw new AppError(response[1], 400)
    }
    
    this.session.setSessionToken(response.session_token)
    return response.session_token
  }

    /**
   * Busca os dados do usuário autenticado no GLPI.
   * - Localiza o usuário pelo `name`.
   * - Salva o `id` e `name` no `GlpiBrowser`.
   * 
   * @returns {Promise<void>}
   */

  public async user () {
    const http = new Http(this.session.getSessionToken())
    const userFetch = await http.request({
      endpoint: '/user?range=0-9999',
      method: 'GET',
    })

    const userFind = userFetch.find((value: User) => value.name === this.session.credentials.user)
    this.session.setUser({
      id: userFind.id,
      name: userFind.name
    })
  }
}