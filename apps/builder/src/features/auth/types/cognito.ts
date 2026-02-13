import { User } from '@typebot.io/prisma'

export type CognitoJWTPayload = {
  email_verified: boolean
  'custom:cloudchat_instance': string
  'custom:hub_role': 'ADMIN' | 'CLIENT' | 'MANAGER'
  'cognito:username': string
  'custom:tenant_id': string
  origin_jti: string
  'custom:tenant_version': string
  'custom:connector_projects': string
  event_id: string
  token_use: string
  auth_time: number
  'custom:claudia_projects': string
  'custom:projects': string
  name: string
  email: string
}

type WithCognitoClaims = {
  cognitoClaims?: Pick<
    CognitoJWTPayload,
    'custom:claudia_projects' | 'custom:hub_role' | 'custom:tenant_id'
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
