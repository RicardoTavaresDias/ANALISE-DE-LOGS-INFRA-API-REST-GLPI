import { broadcastWss2 } from "@/utils/broadcast-ws"
import { GlpiSession } from "./glpi-session"
import { Http } from "@/utils/Http"

/**
 * Classe responsável por manipular chamados no GLPI.
 *
 * - Permite adicionar tarefas em chamados existentes.
 * - Permite fechar chamados adicionando solução.
 */

export class GlpiCalleds {

  /**
   * Gerencia operações relacionadas a chamados no GLPI.
   * @param {GlpiSession} session - Instância do navegador com sessão ativa no GLPI.
   */

  constructor(private session: GlpiSession) {}

  /**
   * Cria uma tarefa em um chamado existente.
   * @param {string} idCalled - ID do chamado (Ticket) no GLPI.
   * @param {string} description - Descrição da tarefa a ser adicionada.
   * @returns {Promise<void>}
   */

  public async taskCalled (idCalled: string, description: string) {
    const http = new Http(this.session.getSessionToken())
    const response = await http.request({
      endpoint: `/TicketTask`,
      method: 'POST',
      content: {
        input: {
          tickets_id: idCalled, // numero de chamado
          content: description, // descrição da tarefa do chamado
          users_id: this.session.getUser()?.id // user GLPI
        }
      }
    })

    if (Array.isArray(response)) {
      broadcastWss2(`<p>❌ Erro ao processar: ` + response[1] + "<p>")
    }
  }

    /**
   * Fecha um chamado adicionando solução.
   * - Aguarda 1 segundo antes de enviar a solução (delay para consistência).
   * - Usa o nome do usuário logado como conteúdo da solução.
   *
   * @param {number} id - ID do chamado (Ticket) no GLPI.
   * @returns {Promise<void>}
   */

  public async calledSolution (id: number) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const nameUser = this.session.getUser()!.name

    const http = new Http(this.session.getSessionToken())
    const response = await http.request({
      endpoint: `/Ticket/${id}/ITILSolution`,
      method: 'POST',
      content: {
        input: {
          items_id:  id,
          itemtype: "Ticket",
          status: 1,
          content: nameUser?.charAt(0).toUpperCase() + nameUser.slice(1)
        }
      }
    })

    if (Array.isArray(response)) {
      broadcastWss2(`<p>❌ Erro ao processar: ` + response[1] + "<p>")
    }
  }
}