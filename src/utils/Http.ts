import { env } from "@/config/env"
import { AppError } from "./AppError"

/**
 * Interface que define os parâmetros para uma requisição HTTP.
 */

interface IHttp {
  endpoint: string 
  method: string
  content?: object
}

/**
 * Classe responsável por realizar requisições HTTP para a API do GLPI.
 */

export class Http {
  private session: string

    /**
   * Cria uma nova instância do cliente HTTP.
   * 
   * @param session - Token de sessão válido para autenticação no GLPI.
   */

  constructor (session: string) {
    this.session = session
  }

    /**
   * Realiza uma requisição à API GLPI
   * @param params Dados da requisição
   * @returns Resposta da API em JSON
   */

  async request ({ endpoint, method, content }: IHttp) {
    try {
      const response = await fetch(`${env.URLGLPI}${endpoint}`, {
        method: method,
        headers: {
          'Content-Type': "application/json",
          'App-Token' : env.APPTOKEN,
          'Session-Token': this.session
        },
  
        body: content ? JSON.stringify(content) : undefined
      })

      const result = await response.json()
      return result
    } catch (error: any) {
      if (error.name === 'FetchError') {
        throw new AppError('Falha na comunicação com o GLPI — verifique o servidor ou certificado SSL.', 503);
      }

      throw new AppError(`Erro inesperado na integração com o GLPI: ${error.message}`, 500)
    }
  }
}