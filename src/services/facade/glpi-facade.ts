import { GlpiSession } from "@/application/glpi-session"
import { GlpiCalleds } from "@/application/glpi-calleds"
import { GlpiAuth } from "@/application/glpi-auth"
import { GlpiCreateCalled } from "@/application/glpi-create-called"
import { dayOfWeek, incrementDay, readTaskCalled, removeFolderUnit, taskCalled, uniqueUnitsToHtml, validationCalledExists } from "@/services/glpi-task-called.services"
import standardizationUnits from "@/lib/standardization-units"
import { AppError } from "@/utils/AppError"
import { broadcastWss2 } from "@/utils/broadcast-ws"
import { GlpiValidationCalled } from "@/application/glpi-validation-called"
import { DateType } from "@/schemas/log-analysis.schema"
import { Credentials } from "@/application/interface/ICredentials"

/**
 * Classe responsável por orquestrar todas as operações de chamados no GLPI.
 *
 * - Valida chamados existentes em um intervalo semanal.
 * - Cria novos chamados quando necessário.
 * - Insere tarefas e fecha chamados quando apropriado.
 * - Remove pastas temporárias das unidades.
 * - Notifica andamento e resultados via WebSocket.
 */

export class GlpiFacade {
  private session: GlpiSession
  private login: GlpiAuth
  private calleds: GlpiCalleds
  private createCalled: GlpiCreateCalled
  private validationCalled: GlpiValidationCalled
  private arrayCalledsExists: string[] = []

  /**
   * Inicializa todas as classes necessárias para interação com GLPI.
   * @param {Credentials} credentials - Credenciais de login no GLPI.
   */

  constructor (credentials: Credentials) {
    this.session = new GlpiSession(credentials)
    this.login = new GlpiAuth(this.session)
    this.calleds = new GlpiCalleds(this.session)
    this.createCalled = new GlpiCreateCalled(this.session)
    this.validationCalled = new GlpiValidationCalled(this.session)
  }

    /**
   * Processa a abertura de chamados para um intervalo de datas.
   * - Valida chamados existentes.
   * - Cria novos chamados quando necessário.
   * - Tramita tarefas e fecha chamados quando apropriado.
   * @param {DateType} dataInterval - Intervalo de datas para processamento.
   */

  public async processCalleds(dataInterval: DateType) {
    await this.login.login()
    await this.validationCalledWeek(dataInterval)

    const calledsExists = await this.checkCalledValidation()
    if (!calledsExists) {
      this.arrayCalledsExists.length = 0
      return
    }
    
    for (const unit of calledsExists) {
      broadcastWss2(`<p>Iniciado abertura de chamado ${unit}</p>`)
      const unitStandard = standardizationUnits[unit.toLowerCase()]

      if (!unitStandard) {
        broadcastWss2(`<p>❌ Unidade "${unit}" não encontrada no arquivo de padronização!</p>`)
        return
      }
     
      try {
        // Criar chamado
        const IdCalledCreate = await this.createCalled.newCalled(standardizationUnits[unit.toLowerCase()].id)
        
        // Agrupa todos os logs refaturado com sucess e error
        const responseUnits = await readTaskCalled(unit)
        if(responseUnits.isError){
          // Inserir tarefa e fecha chamado => log sem Err
          await this.calleds.taskCalled(IdCalledCreate, responseUnits.logs)
          await this.calleds.calledSolution(IdCalledCreate)
        } else {
          // Inserir tarefa e deixa aberto o chamado => logs com Err
          await this.calleds.taskCalled(IdCalledCreate, responseUnits.logs)
        }

        // Remover pasta temporária da unidade
        removeFolderUnit(unit)
        broadcastWss2('<p style="color: #22c55e">Chamado tramitado com sucesso <b>' + unit + "</b></p>")
        broadcastWss2(`<p>---------------------------------------</p>`)

      } catch (error: any) {
        broadcastWss2(`<p>❌ Erro ao processar unidade "${unit}": ` + error.message || error + "<p>")
        throw new AppError(`Falha no processamento da unidade ${unit}`, 500)
      }
    }

    broadcastWss2("<p>🎉 Processamento de chamados concluído!</p>")
    return "🎉 Processamento de chamados concluído!"
  }

  /**
 * Valida os chamados existentes dentro de um intervalo semanal.
 *
 * Para cada dia no intervalo informado:
 * - Incrementa a data inicial.
 * - Verifica se já existem chamados cadastrados para a data.
 * - Caso existam, armazena em `this.arrayCalledsExists`.
 *
 * @param {DateType} dataInterval - Datas de início e fim para validação.
 * @returns {Promise<void>} Promise resolvida após a validação de todos os dias.
 */

  private async validationCalledWeek (dataInterval: DateType) {
    const week = dayOfWeek(dataInterval)

    for (let i: number = 0; i <= week; i++) { 
      const day = incrementDay({ day: i, dateStart: dataInterval.dateStart })

      // Valida se o chamado já existe na data especifica antes de abrir novo chamado e tramitar.
      const calledsExists = await this.validationCalled.existsCalledSpecificDate(day)
      calledsExists.length !== 0 && this.arrayCalledsExists.push(...calledsExists)
    }
  }

   /**
   * Verifica se existem chamados já registrados no período validado.
   *
   * - Se nenhum chamado foi encontrado, executa `taskCalled()`.
   * - Se houver chamados, exibe-os via WebSocket e recusa abertura de chamado já existente.
   *
   * @returns {Promise<false | string[]>} - Lista de unidades validadas
   *   ou `false` caso não existam arquivos/tarefas a serem enviados.
   */

  private async checkCalledValidation (): Promise<false | string[]> {
    if (this.arrayCalledsExists.length === 0) return taskCalled()

    const formattedUnits = uniqueUnitsToHtml(this.arrayCalledsExists)
    broadcastWss2(`
      <p>Existem chamados já registrados dentro do intervalo informado:</p>
      <p style="color: #1da5c2">${formattedUnits.join("")}</p>
    `.trim())

    const resultValidation = await validationCalledExists(formattedUnits)
    if (!resultValidation) {
      broadcastWss2('Não tem arquivo para ser enviado!')
      return false
    }
    
    return resultValidation
  }
}