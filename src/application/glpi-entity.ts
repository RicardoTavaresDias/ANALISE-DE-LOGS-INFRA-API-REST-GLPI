import { env } from "@/config/env";
import { Credentials } from "@/application/interface/ICredentials"

export interface Data {
  id: number
  name: string
  entities_id: number
  completename: string
}

export class GLPIEntity {
  async entity(credentials: Credentials) {
    const session = await fetch(`${env.URLGLPI}/initSession`, {
      method: "POST",
      headers: {
        'Content-Type': "application/json",
        'App-Token': env.APPTOKEN,
      },
      body: JSON.stringify({
        login: credentials.user,
        password: credentials.password
      })
    })
    
    const resultSession = await session.json()

    const result = await fetch(`${env.URLGLPI}/Entity?range=0-9999`, {
      method: "GET",
      headers:  {
        'Content-Type': "application/json",
        'App-Token': env.APPTOKEN,
        'Session-Token': resultSession.session_token
      }
    })

    const data: Data[] = await result.json()

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
}