import { GlpiSession } from "./glpi-session";
import { Http } from "@/utils/Http";

/**
 * Representa os dados de uma entidade no GLPI.
 */

export interface Data {
  id: number
  name: string
  entities_id: number
  completename: string
}

/**
 * Classe responsável por buscar entidades no GLPI.
 */

export class GLPIEntity {

   /**
   * Cria uma instância para consulta de entidades.
   * @param {GlpiSession} session - Sessão autenticada do GLPI.
   */

  constructor(private session: GlpiSession) {}

   /**
   * Busca todas as entidades disponíveis no GLPI.
   *
   * @async
   * @returns {Promise<Data[]>} Lista de entidades retornadas pela API do GLPI.
   */

  async entity() {
    const http = new Http(this.session.getSessionToken())
    const response: Data[] = await http.request({
      endpoint: `/Entity?range=0-9999`,
      method: 'GET'
    })

    return response 
  }
}