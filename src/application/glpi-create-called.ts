import { broadcastWss2 } from "@/utils/broadcast-ws"
import { GlpiSession } from "./glpi-session"
import { Http } from "@/utils/Http"
import { DataGroup, responseGroup } from "@/utils/refature-group-create-calleds"

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

  public async newCalled (IdUnit: number, groupObserver: responseGroup) {
    const http = new Http(this.session.getSessionToken())
    const response = await http.request({
      endpoint: `/Ticket`,
      method: 'POST',
      content: {
        input: {
          entities_id: IdUnit, // ID do unidade
          itilcategories_id: 1030, // Acompanhamento Diario Rotina de Backup
          type: 2,  // Requisição
          requesttypes_id: 1,  // Helpdesk
          global_validation: 1,  // Infraestrutura
          name: "Verificar backup FTP Servidor", // Titulo do chamado
          content: "Validar a conexão do FTP e evidenciar.", // descrição do chamado
          _users_id_requester: 0, // ATOR Requerente
          _groups_id_requester: groupObserver.unit.id, // ATOR Requerente grupo
          _users_id_assign: 0,  //  ATOR Atribuído Usuario
          _groups_id_assign: groupObserver.infra.id, //  ATOR Atribuído grupo
        }
      }
    })

    if (Array.isArray(response)) {
      broadcastWss2(`<p>❌ Erro ao processar: ` + response[1] + "<p>")
    }

    broadcastWss2('<p style="color: #f59e0b">Chamado criado ' + response.id + "</p>")
    this.groupObserver(response.id, groupObserver.unit.id)

    return response.id
  }

   /**
   * Adiciona um grupo como observador (group type = 3) de um chamado existente no GLPI.
   *
   * @async
   * @param {number} id - ID do chamado no GLPI.
   * @param {number} groupObserverUnitID - ID do grupo observador a ser vinculado.
   * @returns {Promise<Response>} - Retorna a resposta da API GLPI.
   */

  private async groupObserver (id: number, groupObserverUnitID: number) {
    const http = new Http(this.session.getSessionToken())
    return await http.request({
      endpoint: `/Ticket/${id}/Group_Ticket`,
      method: 'POST',
      content: {
        input: {
          tickets_id: id,
          groups_id: groupObserverUnitID,
          type: 3
        }
      }
    })
  }

  /**
   * Lista todos os grupos disponíveis no GLPI.
   *
   * @async
   * @returns {Promise<Response>} - Retorna a lista de grupos disponíveis no sistema.
   */

  public async listGroupAtor (): Promise<DataGroup[]> {
    const http = new Http(this.session.getSessionToken())
    return await http.request({
      endpoint: `/Group?range=0-9999`,
      method: 'GET'
    })
  }
}

// Requerente => type: 1
// Observador => type: 3
// Atribuido => type: 2