import { env } from "@/config/env"
import { GlpiBrowser } from "./glpi-session"
import { User } from "./interface/ICredentials"
import { AppError } from "@/utils/AppError"

/**
 * Classe responsável por realizar autenticação no GLPI.
 *
 * - Cria sessão com `initSession`.
 * - Salva o token da sessão no `GlpiBrowser`.
 * - Busca e vincula dados do usuário autenticado.
 */

export class GlpiAuth {

    /**
   * Responsável pela autenticação no GLPI e vinculação do usuário à sessão.
   * @param {GlpiBrowser} browser - Instância do navegador com credenciais e sessão.
   */

  constructor (private browser: GlpiBrowser) {}

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
    const result = await fetch(`${env.URLGLPI}/initSession`, {
      method: "POST",
      headers: {
        'Content-Type': "application/json",
        'App-Token' : "gPqq4ILNGOyemfNJIuPzy2NfUkmXOAYRcbzB0T1e",
      },
      body: JSON.stringify({
        login: this.browser.credentials.user,
        password: this.browser.credentials.password
      })
    })

    const data = await result.json()
    if (Array.isArray(data)) {
      throw new AppError(data[1], 400)
    }

    this.browser.setSessionToken(data.session_token)
    this.User()
  }

    /**
   * Busca os dados do usuário autenticado no GLPI.
   * - Localiza o usuário pelo `name`.
   * - Salva o `id` e `name` no `GlpiBrowser`.
   * 
   * @returns {Promise<void>}
   */

  private async User () {
    const userResult = await fetch(`${env.URLGLPI}/user`, {
      method: "GET",
      headers:  {
        'Content-Type': "application/json",
        'App-Token' : env.APPTOKEN,
        'Session-Token': this.browser.getSessionToken()
      }
    })

    const userFetch = await userResult.json()
    const userFind = userFetch.find((value: User) => value.name === this.browser.credentials.user)
    this.browser.setUser({
      id: userFind.id,
      name: userFind.name
    })
  }
}