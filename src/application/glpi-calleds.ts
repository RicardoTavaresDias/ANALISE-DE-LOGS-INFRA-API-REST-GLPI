import { GlpiBrowser } from "./glpi-session"
import { env } from "@/config/env"

/**
 * Classe responsável por manipular chamados no GLPI.
 *
 * - Permite adicionar tarefas em chamados existentes.
 * - Permite fechar chamados adicionando solução.
 */

export class GlpiCalleds {

  /**
   * Gerencia operações relacionadas a chamados no GLPI.
   * @param {GlpiBrowser} browser - Instância do navegador com sessão ativa no GLPI.
   */

  constructor(private browser: GlpiBrowser) {}

  /**
   * Cria uma tarefa em um chamado existente.
   * @param {string} idCalled - ID do chamado (Ticket) no GLPI.
   * @param {string} description - Descrição da tarefa a ser adicionada.
   * @returns {Promise<void>}
   */

  public async taskCalled (idCalled: string, description: string) {
    await fetch(`${env.URLGLPI}/TicketTask`, {
      method: "POST",
      headers:  {
        'Content-Type': "application/json",
        'App-Token' : env.APPTOKEN,
        'Session-Token': this.browser.getSessionToken()
      },
      body: JSON.stringify({
        input: {
          tickets_id: idCalled, // numero de chamado
          content: description, // descrição da tarefa do chamado
          users_id: this.browser.getUser()?.id // user GLPI
        }
      })
    })
  }

    /**
   * Fecha um chamado adicionando solução.
   * - Aguarda 1 segundo antes de enviar a solução (delay para consistência).
   * - Usa o nome do usuário logado como conteúdo da solução.
   *
   * @param {number} id - ID do chamado (Ticket) no GLPI.
   * @returns {Promise<void>}
   */

  public async closeCalled (id: number) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const nameUser = this.browser.getUser()!.name

    await fetch(`${env.URLGLPI}/Ticket/${id}/ITILSolution`, {
      method: "POST",
       headers:  {
        'Content-Type': "application/json",
        'App-Token' : env.APPTOKEN,
        'Session-Token': this.browser.getSessionToken()
      },
      body: JSON.stringify({
        input: {
          items_id:  id,
          itemtype: "Ticket",
          status: 1,
          content: nameUser?.charAt(0).toUpperCase() + nameUser.slice(1)
        }
      })
    })
  }
}