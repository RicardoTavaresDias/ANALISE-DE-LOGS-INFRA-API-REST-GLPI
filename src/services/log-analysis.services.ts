import regex from "@/lib/regex"

interface State {
  isBlocked: boolean
  hasError: boolean
}

type CacheKey = "currentBlock" | "allLogs" | "errorBuffer"
type CacheMap = Map<CacheKey, string[]>

/**
 * Formata uma linha de log adicionando quebra de linha no início.
 * @param line Linha original
 * @returns Linha formatada
 */

function formatLine (line: string) {
  return `\n${line}`
} 

/**
 * Processa cabeçalho do log: início de backup, execução de tarefa ou intervalo de blocos.
 * @param line Linha do log
 * @param cache Estrutura de cache
 * @param state Estado atual
 */

function headerLog (line: string, cache: CacheMap, state: State): void {
  if (regex.BackupStart.test(line)) {
    getCache(cache, "currentBlock").push(
      "\n###\n",
      "<br><br>-------------------------INTERVALO---------------------------------<br>\n",
      formatLine(line)
    )
    state.isBlocked = true
    return
  } 

  if (regex.TaskRunning.test(line)) {
    getCache(cache, "currentBlock").push(formatLine(line))
    getCache(cache, "allLogs").push(...getCache(cache, "currentBlock"))
    cache.set("currentBlock", [])
    state.isBlocked = false
  } 

  if (state.isBlocked) {
    getCache(cache, "currentBlock").push(formatLine(line))
  } 
}

/**
 * Processa erros detectados no log e os adiciona no buffer de erros ou nos logs finais.
 * @param line Linha do log
 * @param cache Estrutura de cache
 * @param state Estado atual
 */

function bodyErrorLog (line: string, cache: CacheMap, state: State): void {
  if (regex.BackupError.test(line)) {
    getCache(cache, "errorBuffer").push(formatLine("<b>" + line + "</b>"))
  } 

  if (regex.AfterError.test(line)) {
    if (getCache(cache, "errorBuffer").length > 150) {
      getCache(cache, "errorBuffer").length = 0
      getCache(cache, "allLogs").push(formatLine('<br><b style="color: red;">ERR - Em todo arquivo....</b><br>'))
    } else {
      getCache(cache, "allLogs").push(...getCache(cache, "errorBuffer"))
    }
    
    getCache(cache, "allLogs").push(formatLine(line))
    state.hasError = true
  }
}

/**
 * Processa rodapé do log, detectando final de backup.
 * @param line Linha do log
 * @param cache Estrutura de cache
 * @param state Estado atual
 */

function footerLog (line: string, cache: CacheMap, state: State): void {
  if (regex.BackupFinish.test(line)) {
    getCache(cache, "allLogs").push(formatLine(line))
    state.hasError = false
  } 
}

/**
 * Recupera um array do cache ou inicializa se não existir.
 * @param cache Estrutura de cache
 * @param key Chave de cache
 * @returns Array associado à chave
 */

function getCache (cache: CacheMap, key: CacheKey): string[] {
  if(!cache.has(key)) {
    cache.set(key, [])
  }
  
  return cache.get(key)!
}

/**
 * Função principal que percorre o arquivo de log e retorna os logs formatados.
 * @param textFile Array de linhas do log
 * @returns Lista de logs processados
 */

export function parseLogs (textFile: string[]): string[] {
  const state: State = { isBlocked: false, hasError: false }
  const cache: CacheMap = new Map()

  for (const line of textFile) {
    headerLog(line, cache, state)

    if (state.hasError) {
      getCache(cache, "allLogs").push(formatLine(line)) 
    }

    bodyErrorLog(line, cache, state)
    footerLog(line, cache, state)
  }

  return [...getCache(cache, "allLogs")]
}

/**
 * Separa os logs processados em dois grupos:
 *  - "success": trechos de log sem erros
 *  - "error": trechos de log que contêm erros
 *
 * @param {string[]} arrayLogsError - Lista de trechos de log processados
 * @returns {{ success: string, error: string }} Logs separados em sucesso e erro
 */

export function splitLogs (arrayLogsError: string[]): { success: string, error: string } {
  const refactoringLogs = arrayLogsError.join("").split("###")

  return {
    success: refactoringLogs.filter(value => !value.includes("ERR ")).join("\n").trim(),
    error: refactoringLogs.filter(value => value.includes("ERR ")).join("\n").trim()
  }
}