import { createAction, option } from '@typebot.io/forge'
import jwt from 'jsonwebtoken';
import { auth } from '../auth'

export const authenticate = createAction({
  name: 'Authenticate User',
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
    emailVerified: option.string.layout({
      label: 'Email Is Verified',
      defaultValue: "false"
    }),
    tokenVariableId: option.string.layout({
      label: 'Token Variable',
      inputType: 'variableDropdown',
      isRequired: true
    }),
  }),
  run: {
    server: async ({
      credentials: { secretKey, keyId },
      options: { userId, name, email, emailVerified, tokenVariableId },
      variables,
    }) => {
      if (!email || email.length === 0
        || !userId || userId.length === 0
        || !name || name.length === 0
        || secretKey === undefined
        || keyId === undefined
        || tokenVariableId === undefined
      ) return

      var token = jwt.sign({ scope: 'user', external_id: userId, name: name, email: email, email_verified: emailVerified }, secretKey, { algorithm: "HS256", keyid: keyId });
      variables.set(tokenVariableId, token);
    }
  },
})

