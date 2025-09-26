import { refatureEntitys } from "@/utils/refature-entitys";
import { GlpiAuth } from "@/application/glpi-auth";
import { GLPIEntity } from "@/application/glpi-entity";
import { GlpiSession } from "@/application/glpi-session";
import { Credentials } from "@/application/interface/ICredentials";

/**
 * Serviço responsável por autenticar no GLPI,
 * buscar entidades e aplicar a refatoração nos dados.
 */

export class GLPIEntityServices {
  private session: GlpiSession
  private login: GlpiAuth
  private entity: GLPIEntity

   /**
   * Cria uma instância do serviço de entidades do GLPI.
   * @param {Credentials} credentials - Credenciais de acesso ao GLPI.
   */

  constructor (credentials: Credentials) {
    this.session = new GlpiSession(credentials)
    this.login = new GlpiAuth(this.session)
    this.entity = new GLPIEntity(this.session)
  }

   /**
   * Realiza login, busca as entidades no GLPI
   * e retorna a lista já refatorada.
   *
   * @async
   * @returns {Promise<{id: number, name: string, completename: string}[]>}
   * Lista de entidades formatadas.
   */

  async entityServices () {
    await this.login.login()
    const data =  await this.entity.entity()
    return refatureEntitys(data)
  }
}