import { createBlock } from '@typebot.io/forge'
import { InstantchatLogo } from './logo'
import { auth } from '../instantchat/auth'
import { queueJoin } from '../instantchat/actions/queueJoin'
import { checkTime } from '../instantchat/actions/checkTime'
import { cortex } from '../instantchat/actions/cortex'
import { chat } from '../instantchat/actions/chat'
import { wppNotify } from './actions/wppNotify'

export const instantchatBlock = createBlock({
  id: 'instantchat' as const,
  name: 'InstantAIO',
  tags: [],
  LightLogo: InstantchatLogo,
  auth,
  actions: [queueJoin, checkTime, cortex, chat, wppNotify],
})
