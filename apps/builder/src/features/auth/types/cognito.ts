import { User } from '@typebot.io/prisma'

export type CognitoJWTPayload = {
  email_verified: boolean
  'custom:hub_role': 'ADMIN' | 'CLIENT' | 'MANAGER'
  'cognito:username': string
  origin_jti: string
  'custom:tenant_version': string
  event_id: string
  token_use: string
  auth_time: number
  'custom:projects': string
  'custom:eddie_workspaces': string
  name: string
  email: string
}

type WithCognitoClaims = {
  cognitoClaims?: Pick<
    CognitoJWTPayload,
    'custom:eddie_workspaces' | 'custom:hub_role'
  >
}

// Database user extended with Cognito claims
export type DatabaseUserWithCognito = User &
  WithCognitoClaims & { cloudChatAuthorization?: boolean }

// NextAuth JWT token that contains Cognito claims
export type NextAuthJWTWithCognito = Record<string, unknown> &
  WithCognitoClaims & {
    userId?: string
    email?: string
    name?: string
    image?: string
    provider?: string
  }
