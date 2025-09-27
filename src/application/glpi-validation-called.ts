import { GlpiSession } from "./glpi-session"
import { Root } from "./interface/ICredentials"
import { broadcastWss2 } from "@/utils/broadcast-ws"
import { Http } from "@/utils/Http"

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
   * @param {GlpiSession} session - Instância do navegador com sessão ativa.
   */
  
  constructor (private session: GlpiSession) {}

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
    const http = new Http(this.session.getSessionToken())
    const response: Root = await http.request({
      endpoint: `/search/Ticket?
        criteria[0][field]=1&
        criteria[0][searchtype]=contains&
        criteria[0][value]=Verificar backup FTP Servidor&
        criteria[1][link]=AND&
        criteria[1][field]=26&
        criteria[1][searchtype]=contains&
        criteria[1][value]=${day}
      `.trim(),
      method: 'GET'
    })

    if (Array.isArray(response)) {
      broadcastWss2(`<p>❌ Erro ao processar: ` + response[1] + "<p>")
    }
    
    if (response.count === 0) return []

    const idCalledExists = response.data.map((value) => [ String(value["2"]), value["80"].replace("REGIAO SACA > ", "") ]).flat()
    return idCalledExists
  }
}