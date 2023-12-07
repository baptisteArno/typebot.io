import { createBlock } from '@typebot.io/forge'
import { ChatnodeAiLogo } from './logo'
import { auth } from './auth'
import {sendMessage} from "./actions/sendMessage";

export const chatnodeAi = createBlock({
  id: 'chatnode-ai',
  name: 'ChatNode.AI',
  tags: ['ai', "openai", "document", "url"],
  LightLogo: ChatnodeAiLogo,
  auth,
  actions: [sendMessage],
})
