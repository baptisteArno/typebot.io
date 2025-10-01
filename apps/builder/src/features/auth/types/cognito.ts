import { User } from '@typebot.io/prisma'

// Cognito custom claims structure
export interface CognitoClaims {
  'custom:hub_role'?: 'ADMIN' | 'CLIENT' | 'MANAGER'
  'custom:tenant_id'?: string
  'custom:claudia_projects'?: string
}

// Base interface for anything that can have Cognito claims
export interface WithCognitoClaims {
  cognitoClaims?: CognitoClaims
}

// Database user extended with Cognito claims
export interface DatabaseUserWithCognito extends User, WithCognitoClaims {}

// NextAuth JWT token that contains Cognito claims
export interface NextAuthJWTWithCognito
  extends Record<string, unknown>,
    WithCognitoClaims {
  userId?: string
  email?: string
  name?: string
  image?: string
  provider?: string
}

// NextAuth session with Cognito-enabled user
export interface NextAuthSessionWithCognito {
  user: DatabaseUserWithCognito
  expires: string
}
