import { broadcastWss2 } from "@/utils/broadcast-ws"
import { GlpiBrowser } from "./glpi-session"
import { env } from "@/config/env"

/**
 * Classe responsável por criar novos chamados no GLPI.
 *
 * - Cria chamado vinculado a uma unidade (entity).
 * - Define categoria, tipo e atores envolvidos.
 * - Notifica criação do chamado via WebSocket.
 */

export class GlpiCreateCalled {

    /**
   * Responsável pela criação de chamados no GLPI.
   * @param {GlpiBrowser} browser - Instância do navegador com sessão ativa no GLPI.
   */

  constructor (private browser: GlpiBrowser) {}

    /**
   * Cria um novo chamado no GLPI.
   * - Associa o chamado a uma unidade específica.
   * - Define categoria, tipo e atores responsáveis.
   * - Notifica via WebSocket a criação.
   *
   * @param {number} IdUnit - ID da unidade (entity) no GLPI.
   * @returns {Promise<number>} - ID do chamado criado.
   */

  public async newCalled (IdUnit: number) {
    const result = await fetch(`${env.URLGLPI}/Ticket`, {
      method: "POST",
      headers:  {
        'Content-Type': "application/json",
        'App-Token' : env.APPTOKEN,
        'Session-Token': this.browser.getSessionToken()
      },
      body: JSON.stringify({
          input: {
          entities_id: IdUnit, // ID do unidade
          itilcategories_id: 2, // Acompanhamento Diario Rotina de Backup
          type: 2,  // Requisição
          requesttypes_id: 1,  // Helpdesk
          global_validation: 1,  // Infraestrutura
          name: "Verificar backup FTP Servidor", // Titulo do chamado
          content: "Validar a conexão do FTP e evidenciar.", // descrição do chamado
          _users_id_requester: 0, // ATOR Requerente
          _users_id_assign: 0,  //  ATOR Atribuído Usuario
          _groups_id_assign: 1 //  ATOR Atribuído grupo
        }
      })
    })

    const data = await result.json()
    if (Array.isArray(data)) {
      broadcastWss2(`<p>❌ Erro ao processar: ` + data[1] + "<p>")
    }

    broadcastWss2('<p style="color: #f59e0b">Chamado criado ' + data.id + "</p>")
    return data.id
  }
}