import { env } from "@/config/env"

interface IHttp {
  endpoint: string 
  method: string
  content?: object
}

export class Http {
  private session: string

  constructor (session: string) {
    this.session = session
  }

  async request ({ endpoint, method, content }: IHttp) {
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
  }
}