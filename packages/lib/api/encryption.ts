import { Credentials } from '@typebot.io/schemas/features/credentials'
import { decryptV1 } from './encryptionV1'

const algorithm = 'AES-GCM'
const secretKey = process.env.ENCRYPTION_SECRET

export const encrypt = async (
  data: object
): Promise<{ encryptedData: string; iv: string }> => {
  if (!secretKey) throw new Error('ENCRYPTION_SECRET is not in environment')
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encodedData = new TextEncoder().encode(JSON.stringify(data))

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secretKey),
    algorithm,
    false,
    ['encrypt']
  )

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: algorithm, iv },
    key,
    encodedData
  )

  const encryptedData = btoa(
    String.fromCharCode.apply(null, Array.from(new Uint8Array(encryptedBuffer)))
  )

  const ivHex = Array.from(iv)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')

  return {
    encryptedData,
    iv: ivHex,
  }
}

export const decrypt = async (
  encryptedData: string,
  ivHex: string
): Promise<object> => {
  if (ivHex.length !== 24) return decryptV1(encryptedData, ivHex)
  if (!secretKey) throw new Error('ENCRYPTION_SECRET is not in environment')
  const iv = new Uint8Array(
    ivHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? []
  )

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secretKey),
    algorithm,
    false,
    ['decrypt']
  )

  const encryptedBuffer = new Uint8Array(
    Array.from(atob(encryptedData)).map((char) => char.charCodeAt(0))
  )

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: algorithm, iv },
    key,
    encryptedBuffer
  )

  const decryptedData = new TextDecoder().decode(decryptedBuffer)
  return JSON.parse(decryptedData)
}

export const isCredentialsV2 = (credentials: Pick<Credentials, 'iv'>) =>
  credentials.iv.length === 24
