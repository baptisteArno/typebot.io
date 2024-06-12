import { option, AuthDefinition, createAuth } from '@typebot.io/forge'
import { baseOptions } from './baseOptions'

// export const auth = {
//   type: 'encryptedCredentials',
//   name: 'InstantAIO account',
//   schema: baseOptions,
// } satisfies AuthDefinition

export const auth = createAuth({
  type: 'encryptedCredentials',
  name: 'InstantAIO account',
  schema: baseOptions,
})
