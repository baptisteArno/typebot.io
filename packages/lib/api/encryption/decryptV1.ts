import { env } from '@typebot.io/env'
import { createDecipheriv } from 'crypto'

const algorithm = 'aes-256-gcm'
const secretKey = env.ENCRYPTION_SECRET

export const decryptV1 = (encryptedData: string, auth: string): object => {
  if (!secretKey) throw new Error(`ENCRYPTION_SECRET is not in environment`)
  const [iv, tag] = auth.split('.')
  const decipher = createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(iv, 'hex')
  )
  decipher.setAuthTag(Buffer.from(tag, 'hex'))
  return JSON.parse(
    (
      decipher.update(Buffer.from(encryptedData, 'hex')) + decipher.final('hex')
    ).toString()
  )
}
