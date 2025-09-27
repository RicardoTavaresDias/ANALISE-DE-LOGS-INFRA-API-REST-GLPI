import { broadcastWss2 } from "@/utils/broadcast-ws"
import { GlpiSession } from "./glpi-session"
import { Http } from "@/utils/Http"

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
   * @param {GlpiSession} session - Instância do navegador com sessão ativa no GLPI.
   */

  constructor (private session: GlpiSession) {}

    /**
   * Cria um novo chamado no GLPI.
   * - Associa o chamado a uma unidade específica (entity).
   * - Define categoria, tipo e atores responsáveis.
   * - Adiciona um grupo como observador do chamado.
   * - Notifica via WebSocket o resultado da operação.
   *
   * @param {number} IdUnit - ID da unidade (entity) no GLPI.
   * @returns {Promise<number>} - ID do chamado criado.
   */

  public async newCalled (IdUnit: number) {
    const http = new Http(this.session.getSessionToken())
    const response = await http.request({
      endpoint: `/Ticket`,
      method: 'POST',
      content: {
        input: {
          entities_id: IdUnit, // ID do unidade
          itilcategories_id: 2, // Acompanhamento Diario Rotina de Backup
          type: 2,  // Requisição
          requesttypes_id: 1,  // Helpdesk
          global_validation: 1,  // Infraestrutura
          name: "Verificar backup FTP Servidor", // Titulo do chamado
          content: "Validar a conexão do FTP e evidenciar.", // descrição do chamado
          _users_id_requester: 0, // ATOR Requerente
          _groups_id_requester: 4, // ATOR Requerente grupo
          _users_id_assign: 0,  //  ATOR Atribuído Usuario
          _groups_id_assign: 1, //  ATOR Atribuído grupo
        }
      }
    })

    if (Array.isArray(response)) {
      broadcastWss2(`<p>❌ Erro ao processar: ` + response[1] + "<p>")
    }

    broadcastWss2('<p style="color: #f59e0b">Chamado criado ' + response.id + "</p>")
    this.groupObserver(response.id)

    return response.id
  }

   /**
   * Adiciona um grupo como observador de um chamado existente no GLPI.
   *
   * @param {number} id - ID do chamado no GLPI.
   * @returns {Promise<Response>} - Resposta da API GLPI.
   */

  async groupObserver (id: number) {
    const http = new Http(this.session.getSessionToken())
    return await http.request({
      endpoint: `/Ticket/${id}/Group_Ticket`,
      method: 'POST',
      content: {
        input: {
          tickets_id: id,
          groups_id: 4,
          type: 3
        }
      }
    })
  }
}

// Requerente => type: 1
// Observador => type: 3
// Atribuido => type: 2