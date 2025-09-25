import { Credentials, User } from "./interface/ICredentials"

/**
 * Classe responsável por armazenar credenciais, sessão
 * e usuário autenticado no GLPI.
 *
 * - Mantém o token de sessão ativo.
 * - Armazena dados do usuário logado.
 * - Fornece métodos para recuperar informações da sessão.
 */

export class GlpiBrowser {
  public credentials: Credentials
  private sessionToken: string
  private user: User | null = null

   /**
   * Inicializa a instância do GlpiBrowser com as credenciais fornecidas.
   * @param {Credentials} credentials - Credenciais do usuário para autenticação.
   */

  constructor(credentials: Credentials){
    this.credentials = credentials
    this.sessionToken = ''
  }

    /**
   * Define o token de sessão atual.
   * @param {string} value - Token de sessão.
   * @returns {string} - Token armazenado.
   */

  public async setSessionToken(value: string) {
    return this.sessionToken = value
  }

    /**
   * Retorna o token de sessão atual.
   * @returns {string} - Token de sessão.
   */

  public getSessionToken(): string {
    return this.sessionToken
  }

   /**
   * Define o usuário atualmente autenticado.
   * @param {User} value - Dados do usuário autenticado.
   * @returns {User} - Usuário armazenado.
   */

  public async setUser(value: User) {
    return this.user = value
  }

  /**
   * Retorna o usuário atualmente autenticado, ou `null` se não houver.
   * @returns {User | null} - Usuário autenticado.
   */

  public getUser(): User | null {
    return this.user
  }
}