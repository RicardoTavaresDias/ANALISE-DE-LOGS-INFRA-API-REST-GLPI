/**
 * Interface que representa um grupo retornado pela API do GLPI.
 *
 * Contém informações de identificação, hierarquia e permissões
 * associadas a um grupo dentro da entidade GLPI.
 */

export interface DataGroup {
  id: number
  entities_id: number
  is_recursive: number
  name: string
  comment: any
  ldap_field: any
  ldap_value: any
  ldap_group_dn: any
  date_mod: string
  groups_id: number
  completename: string
  level: number
  ancestors_cache: string
  sons_cache: string
  is_requester: number
  is_watcher: number
  is_assign: number
  is_task: number
  is_notify: number
  is_itemgroup: number
  is_usergroup: number
  is_manager: number
  date_creation: string
  links: any[][]
}

/**
 * Tipo que define o grupo de infraestrutura e o grupo de unidade
 * utilizados durante a criação de chamados no GLPI.
 */

export type responseGroup = {
  infra: {
    id: number,
    name: string
  },
  unit: {
    id: number,
    name: string
  }
}

/**
 * Função responsável por identificar e estruturar os grupos envolvidos
 * na criação de chamados no GLPI.
 *
 * - Localiza o grupo de **Infraestrutura T.I** (responsável técnico).
 * - Localiza o grupo da **Unidade** (requerente).
 * - Retorna ambos os grupos no formato esperado por `GlpiCreateCalled`.
 *
 * @param {DataGroup[]} data - Lista de grupos retornada pela API GLPI.
 * @returns {responseGroup} - Objeto contendo os grupos de infraestrutura e unidade.
 */

export function groupsCreateCalled (data: DataGroup[]): responseGroup {
  const groupObserver = data.map(value => ({
    id: value.id,
    name: value.name
  }))

  const infra = groupObserver.find(value => value.name.includes('Infraestrutura T.I'))!
  const unit = groupObserver.find(value => value.name.includes('UBS/ESF Vila Aparecida'))!

  return {
    infra,
    unit
  }
}