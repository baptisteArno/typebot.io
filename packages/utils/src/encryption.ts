import { randomBytes, createCipheriv, createDecipheriv } from 'crypto'

const algorithm = 'aes-256-gcm'
const secretKey = process.env.ENCRYPTION_SECRET

export const encrypt = (
  data: object
): { encryptedData: string; iv: string } => {
  if (!secretKey) throw new Error(`ENCRYPTION_SECRET is not in environment`)
  const iv = randomBytes(16)
  const cipher = createCipheriv(algorithm, secretKey, iv)
  const dataString = JSON.stringify(data)
  const encryptedData =
    cipher.update(dataString, 'utf8', 'hex') + cipher.final('hex')
  const tag = cipher.getAuthTag()
  return {
    encryptedData,
    iv: iv.toString('hex') + '.' + tag.toString('hex'),
  }
}

export const decrypt = (encryptedData: string, auth: string): object => {
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
