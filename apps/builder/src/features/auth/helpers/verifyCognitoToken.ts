import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose'
import { CognitoJWTPayload } from '../types/cognito'

export const verifyCognitoToken = async ({
  cognitoAppClientId,
  cognitoIssuerUrl,
  cognitoToken,
}: {
  cognitoToken: string
  cognitoIssuerUrl: string
  cognitoAppClientId: string
}): Promise<JWTPayload & CognitoJWTPayload> => {
  const jwks = createRemoteJWKSet(
    new URL(`${cognitoIssuerUrl}/.well-known/jwks.json`)
  )

  const { payload } = await jwtVerify<CognitoJWTPayload>(cognitoToken, jwks, {
    issuer: cognitoIssuerUrl,
    audience: cognitoAppClientId,
  })

  return payload
}
