import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose'
import { CognitoJWTPayload } from '../types/cognito'

/**
 * In development, skip real JWKS verification and decode the JWT payload directly.
 * The token is expected to be a standard JWT (header.payload.signature) where the
 * payload contains at least { email, ... }. Signature is not verified.
 *
 * In production, full Cognito JWKS verification is performed.
 */
export const verifyCognitoToken = async ({
  cognitoAppClientId,
  cognitoIssuerUrl,
  cognitoToken,
}: {
  cognitoToken: string
  cognitoIssuerUrl: string
  cognitoAppClientId: string
}): Promise<JWTPayload & CognitoJWTPayload> => {
  if (process.env.NODE_ENV === 'development') {
    // Dev bypass: decode JWT payload without signature verification
    try {
      const parts = cognitoToken.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(
          Buffer.from(parts[1], 'base64url').toString('utf-8')
        )
        return payload as JWTPayload & CognitoJWTPayload
      }
      // Fallback: treat the whole token as a base64-encoded JSON payload
      const payload = JSON.parse(
        Buffer.from(cognitoToken, 'base64url').toString('utf-8')
      )
      return payload as JWTPayload & CognitoJWTPayload
    } catch (e) {
      throw new Error(`[dev] Failed to decode token payload: ${e}`)
    }
  }

  const jwks = createRemoteJWKSet(
    new URL(`${cognitoIssuerUrl}/.well-known/jwks.json`)
  )

  const { payload } = await jwtVerify<CognitoJWTPayload>(cognitoToken, jwks, {
    issuer: cognitoIssuerUrl,
    audience: cognitoAppClientId,
  })

  return payload
}
