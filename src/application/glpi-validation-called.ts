import { env } from "@/config/env"
import { GlpiBrowser } from "./glpi-session"
import { Root } from "./interface/ICredentials"

/**
 * Classe responsável por validar existência de chamados
 * em datas específicas no GLPI.
 *
 * - Verifica se já existe chamado criado para a data.
 * - Retorna lista de IDs e nomes de unidades encontradas.
 */

export class GlpiValidationCalled {

    /**
   * Responsável por validar a existência de chamados no GLPI
   * dentro de uma data específica.
   * @param {GlpiBrowser} browser - Instância do navegador com sessão ativa.
   */
  
  constructor (private browser: GlpiBrowser) {}

    /**
   * Verifica se já existe chamado para uma data específica.
   * - Faz busca no GLPI filtrando pelo título do chamado
   *   e pela data de abertura.
   * - Retorna lista de IDs e nomes das unidades correspondentes.
   *
   * @param {string} day - Data no formato reconhecido pelo GLPI (ex: "2025-09-24").
   * @returns {Promise<string[]>} - Lista com IDs e nomes das unidades já registradas.
   *   Retorna array vazio se não houver chamados.
   */

  public async existsCalledSpecificDate (day: string): Promise<string[]> {
    const result =  await fetch(
      `${env.URLGLPI}/search/Ticket?
        criteria[0][field]=1&
        criteria[0][searchtype]=contains&
        criteria[0][value]=Verificar backup FTP Servidor&
        criteria[1][link]=AND&
        criteria[1][field]=26&
        criteria[1][searchtype]=contains&
        criteria[1][value]=${day}
      `.trim(), {
      method: "GET",
      headers: {
        'Content-Type': "application/json",
        'App-Token' : env.APPTOKEN,
        'Session-Token': this.browser.getSessionToken()
      }
    })

    const data: Root = await result.json()
    if (data.count === 0) return []

    const idCalledExists = data.data.map((value) => [ String(value["2"]), value["80"].replace("REGIAO SACA > ", "") ]).flat()
    return idCalledExists
  }
}