import prisma from '@typebot.io/lib/prisma'
import { getAuthOptions } from '@/pages/api/auth/[...nextauth]'
import * as Sentry from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { env } from '@typebot.io/env'
import { mockedUser } from '@typebot.io/lib/mockedUser'
import { DatabaseUserWithCognito } from '../types/cognito'
import { verifyCognitoToken } from './verifyCognitoToken'
import logger from '@/helpers/logger'

export const getAuthenticatedUser = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<DatabaseUserWithCognito | undefined> => {
  const bearerToken = extractBearerToken(req)

  if (req.query.apiGateway === 'true' && bearerToken)
    return authenticateByEmbeddedToken(bearerToken)

  if (bearerToken) return authenticateByToken(bearerToken)

  const session = env.NEXT_PUBLIC_E2E_TEST
    ? { user: mockedUser }
    : await getServerSession(req, res, getAuthOptions({}))

  const user = session?.user as DatabaseUserWithCognito | undefined
  if (!user || !('id' in user)) return
  Sentry.setUser({ id: user.id })
  return user
}

const authenticateByEmbeddedToken = async (
  token: string
): Promise<DatabaseUserWithCognito | undefined> => {
  try {
    const payload = await verifyCognitoToken({
      cognitoAppClientId: env.CLOUDCHAT_COGNITO_APP_CLIENT_ID,
      cognitoIssuerUrl: env.COGNITO_ISSUER_URL,
      cognitoToken: token,
    })

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    })

    if (!user) return

    return {
      ...user,
      cognitoClaims: {
        'custom:hub_role': payload['custom:hub_role'],
        'custom:tenant_id': payload['custom:tenant_id'],
        'custom:claudia_projects': payload['custom:claudia_projects'],
      },
    }
  } catch (error) {
    logger.error('Error in verify cognito token', { error })
  }
}

const authenticateByToken = async (
  apiToken: string
): Promise<DatabaseUserWithCognito | undefined> => {
  if (typeof window !== 'undefined') return
  const user = (await prisma.user.findFirst({
    where: { apiTokens: { some: { token: apiToken } } },
  })) as DatabaseUserWithCognito | null
  if (!user) return
  Sentry.setUser({ id: user.id })
  return user
}

const extractBearerToken = (req: NextApiRequest) =>
  req.headers['authorization']?.slice(7)
