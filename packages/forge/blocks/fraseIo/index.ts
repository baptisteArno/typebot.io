import { createBlock } from '@typebot.io/forge'
import { FraseIoLogo, FraseIoLogoDark } from './logo'
import { auth } from './auth'
import { processSerp } from './actions/processSERP'

export const fraseIoBlock = createBlock({
  id: 'frase-io',
  name: 'Frase.io',
  tags: ['SEO', 'SERP'],
  LightLogo: FraseIoLogo,
  DarkLogo: FraseIoLogoDark,
  auth,
  actions: [processSerp],
})
