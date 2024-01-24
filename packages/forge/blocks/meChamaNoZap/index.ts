import { createBlock, option } from '@typebot.io/forge'
import { MeChamaNoZapLogo } from './logo'
import { auth } from './auth'
import { editConversationStatus } from './actions/editConversationStatus'
import { baseOptions } from './baseOptions'
import { transferToTeam } from './actions/transferToTeam'

export const ATENDIMENTO_URL = 'https://atendimento.mechamanozap.net'

export const meChamaNoZap = createBlock({
  id: 'me-chama-no-zap',
  name: 'Me Chama No Zap',
  tags: [],
  LightLogo: MeChamaNoZapLogo,
  auth,
  actions: [editConversationStatus, transferToTeam],
  options: baseOptions,
})
