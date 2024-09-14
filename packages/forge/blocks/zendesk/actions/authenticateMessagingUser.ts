import { createAction, option } from '@typebot.io/forge'
import { sign } from 'jsonwebtoken';
import { auth } from '../auth'

export const authenticateMessagingUser = createAction({
  name: 'Authenticate Messaging User',
  auth,
  options: option.object({
    userId: option.string.layout({
      label: 'User ID',
      isRequired: true,
    }),
    name: option.string.layout({
      label: 'Name',
      isRequired: true,
    }),
    email: option.string.layout({
      label: 'Email',
      isRequired: true,
    }),
    isEmailVerified: option.string.layout({
      label: 'Is email verified',
      inputType: 'variableDropdown',
      isRequired: true
    }),
    tokenVariableId: option.string.layout({
      label: 'Token variable',
      inputType: 'variableDropdown',
      isRequired: true
    }),
  }),
  run: {
    server: async ({
      credentials: { conversationsSecretKey, conversationsKeyId },
      options: { userId, name, email, isEmailVerified, tokenVariableId },
      variables,
    }) => {
      if (!email || email.length === 0
        || !userId || userId.length === 0
        || !name || name.length === 0
        || conversationsSecretKey === undefined
        || conversationsKeyId === undefined
        || tokenVariableId === undefined
      ) return
      variables.set(tokenVariableId, sign({ scope: 'user', external_id: userId, name: name, email: email, email_verified: "true" }, conversationsSecretKey, { algorithm: "HS256", keyid: conversationsKeyId }));
    }
  },
})

