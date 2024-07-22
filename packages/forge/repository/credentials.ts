import { anthropicBlock } from '@typebot.io/anthropic-block'
import { anthropicCredentialsSchema } from '@typebot.io/anthropic-block/schemas'
import { chatNodeBlock } from '@typebot.io/chat-node-block'
import { chatNodeCredentialsSchema } from '@typebot.io/chat-node-block/schemas'
import { difyAiBlock } from '@typebot.io/dify-ai-block'
import { difyAiCredentialsSchema } from '@typebot.io/dify-ai-block/schemas'
import { elevenlabsBlock } from '@typebot.io/elevenlabs-block'
import { elevenlabsCredentialsSchema } from '@typebot.io/elevenlabs-block/schemas'
import { mistralBlock } from '@typebot.io/mistral-block'
import { mistralCredentialsSchema } from '@typebot.io/mistral-block/schemas'
import { openRouterBlock } from '@typebot.io/open-router-block'
import { openRouterCredentialsSchema } from '@typebot.io/open-router-block/schemas'
import { openAIBlock } from '@typebot.io/openai-block'
import { openAICredentialsSchema } from '@typebot.io/openai-block/schemas'
import { togetherAiBlock } from '@typebot.io/together-ai-block'
import { togetherAiCredentialsSchema } from '@typebot.io/together-ai-block/schemas'
import { nocodbBlock } from '@typebot.io/nocodb-block'
import { nocodbCredentialsSchema } from '@typebot.io/nocodb-block/schemas'

export const forgedCredentialsSchemas = {
  [openAIBlock.id]: openAICredentialsSchema,
  [chatNodeBlock.id]: chatNodeCredentialsSchema,
  [difyAiBlock.id]: difyAiCredentialsSchema,
  [mistralBlock.id]: mistralCredentialsSchema,
  [elevenlabsBlock.id]: elevenlabsCredentialsSchema,
  [anthropicBlock.id]: anthropicCredentialsSchema,
  [togetherAiBlock.id]: togetherAiCredentialsSchema,
  [openRouterBlock.id]: openRouterCredentialsSchema,
  [nocodbBlock.id]: nocodbCredentialsSchema,
}
