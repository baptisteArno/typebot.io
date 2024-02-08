import { createBlock } from '@typebot.io/forge'
import { MistralLogo } from './logo'
import { auth } from './auth'
import { createChatCompletion } from './actions/createChatCompletion'

export const mistral = createBlock({
  id: 'mistral',
  name: 'Mistral',
  tags: ['ai', 'chat', 'completion'],
  fullName:
    "Incorporate Mistral AI's models for sophisticated and responsive chatbot interactions",
  LightLogo: MistralLogo,
  auth,
  actions: [createChatCompletion],
  docsUrl: 'https://docs.typebot.io/forge/blocks/mistral',
})
