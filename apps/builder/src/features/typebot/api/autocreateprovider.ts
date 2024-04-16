import prisma from '@typebot.io/lib/prisma'
import { encrypt } from '@typebot.io/lib/api/encryption/encrypt'

interface Credentials {
  baseUrl: string
  accountcode: string
  wsKey?: string
  cortexUrl?: string
  cortexAccountID?: string
  cortexToken?: string
}

interface ProviderInput {
  data: Credentials
  type: string
  workspaceId: string
  name: string
}

interface CortexCredentiais {
  baseUrl: string
  token: string
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const createInstantProviderCredentials = async (
  input: ProviderInput,
  cortex?: CortexCredentiais
) => {
  if (cortex) {
    console.log('cortex', cortex)
  }
  const { encryptedData, iv } = await encrypt(input.data)
  console.log('createCredentials Data', input)
  console.log('encryptedData', encryptedData, iv)
  try {
    const listInstantCredentials = await prisma.credentials.findFirst({
      where: {
        workspaceId: input.workspaceId,
        type: input.type,
      },
    })
    if (listInstantCredentials) {
      console.log('Credentials already exists')
      return false
    }
  } catch (e) {
    console.log('Error in finding credentials', e)
  }

  const createdCredentials = await prisma.credentials.create({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    data: {
      ...input,
      data: encryptedData,
      iv,
    },
    select: {
      id: true,
    },
  })

  return createdCredentials
}
