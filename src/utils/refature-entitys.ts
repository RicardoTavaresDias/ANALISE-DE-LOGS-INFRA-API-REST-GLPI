import { Data } from "@/application/glpi-entity";

/**
 * Refatora a lista de entidades, removendo itens relacionados a "Comunicação"
 * e retornando apenas os campos essenciais.
 *
 * @param {Data[]} data - Lista de entidades recebidas do GLPI.
 * @returns {{id: number, name: string, completename: string}[]} Lista de entidades filtradas e formatadas.
 */

export function refatureEntitys (data: Data[]) {
  const removeCommunication = data.filter(value => !value.completename.includes("Comunicação"))
    const FormatUnits = removeCommunication.map(value => {
      if(value.name === "Comunicação") {
        return
      }

      return {
        id: value.id,
        name: value.name,
        completename: value.completename
      }
    })

  return FormatUnits
}