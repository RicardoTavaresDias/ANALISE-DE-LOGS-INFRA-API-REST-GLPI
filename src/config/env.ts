import z from "zod"
import * as dotenv from 'dotenv'
import * as path from 'path'

// Carregar o arquivo .env de forma dinâmica
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  URL: z.string().url(),
  APPTOKEN: z.string(),
  PATCHFILE: z.string().default('./unidade'),
  URLGLPI: z.string().url()
})

const env = envSchema.parse(process.env)
export { env }