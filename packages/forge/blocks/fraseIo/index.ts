import { createBlock } from '@typebot.io/forge'
import { FraseIoLogo, FraseIoLogoDark } from './logo'
import { auth } from './auth'

export const fraseIoBlock = createBlock({
  id: 'frase-io',
  name: 'Frase.io',
  tags: [],
  LightLogo: FraseIoLogo,
  DarkLogo: FraseIoLogoDark,
  auth,
  actions: [],
})
