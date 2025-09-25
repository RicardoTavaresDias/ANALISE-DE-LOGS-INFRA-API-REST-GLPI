export interface Credentials {
  user: string
  password: string
}

export interface User {
  id: number,
  name: string
}

export interface Root {
  totalcount: number
  count: number
  sort: string
  order: string
  "content-range": string
  data: data[]
}

interface data {
  "1": string
  "2": number
  "3": number
  "4": any
  "5": string
  "7": string
  "12": number
  "15": string
  "18": any
  "19": string
  "26": string
  "80": string
}