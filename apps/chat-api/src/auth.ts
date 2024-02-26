import { env } from '@typebot.io/env'
import { mockedUser } from '@typebot.io/lib/mockedUser'
import prisma from '@typebot.io/lib/prisma'

export const getAuthenticatedUserId = async (
  authorizationHeaderValue: string | undefined
): Promise<string | undefined> => {
  if (env.NEXT_PUBLIC_E2E_TEST) return mockedUser.id
  const bearerToken = extractBearerToken(authorizationHeaderValue)
  if (!bearerToken) return
  return authenticateByToken(bearerToken)
}

const authenticateByToken = async (
  token: string
): Promise<string | undefined> => {
  if (typeof window !== 'undefined') return
  const apiToken = await prisma.apiToken.findFirst({
    where: {
      token,
    },
    select: {
      ownerId: true,
    },
  })
  return apiToken?.ownerId
}

const extractBearerToken = (authorizationHeaderValue: string | undefined) =>
  authorizationHeaderValue?.slice(7)
