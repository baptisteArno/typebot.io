import { anthropicBlock } from '@sniper.io/anthropic-block'
import { anthropicCredentialsSchema } from '@sniper.io/anthropic-block/schemas'
import { calComBlock } from '@sniper.io/cal-com-block'
import { calComCredentialsSchema } from '@sniper.io/cal-com-block/schemas'
import { chatNodeBlock } from '@sniper.io/chat-node-block'
import { chatNodeCredentialsSchema } from '@sniper.io/chat-node-block/schemas'
import { difyAiBlock } from '@sniper.io/dify-ai-block'
import { difyAiCredentialsSchema } from '@sniper.io/dify-ai-block/schemas'
import { elevenlabsBlock } from '@sniper.io/elevenlabs-block'
import { elevenlabsCredentialsSchema } from '@sniper.io/elevenlabs-block/schemas'
import { mistralBlock } from '@sniper.io/mistral-block'
import { mistralCredentialsSchema } from '@sniper.io/mistral-block/schemas'
import { openRouterBlock } from '@sniper.io/open-router-block'
import { openRouterCredentialsSchema } from '@sniper.io/open-router-block/schemas'
import { openAIBlock } from '@sniper.io/openai-block'
import { openAICredentialsSchema } from '@sniper.io/openai-block/schemas'
import { qrCodeBlock } from '@sniper.io/qrcode-block'
import { qrCodeCredentialsSchema } from '@sniper.io/qrcode-block/schemas'
import { togetherAiBlock } from '@sniper.io/together-ai-block'
import { togetherAiCredentialsSchema } from '@sniper.io/together-ai-block/schemas'
import { zemanticAiBlock } from '@sniper.io/zemantic-ai-block'
import { zemanticAiCredentialsSchema } from '@sniper.io/zemantic-ai-block/schemas'
import { nocodbBlock } from '@sniper.io/nocodb-block'
import { nocodbCredentialsSchema } from '@sniper.io/nocodb-block/schemas'

export const forgedCredentialsSchemas = {
  [openAIBlock.id]: openAICredentialsSchema,
  [zemanticAiBlock.id]: zemanticAiCredentialsSchema,
  [calComBlock.id]: calComCredentialsSchema,
  [chatNodeBlock.id]: chatNodeCredentialsSchema,
  [qrCodeBlock.id]: qrCodeCredentialsSchema,
  [difyAiBlock.id]: difyAiCredentialsSchema,
  [mistralBlock.id]: mistralCredentialsSchema,
  [elevenlabsBlock.id]: elevenlabsCredentialsSchema,
  [anthropicBlock.id]: anthropicCredentialsSchema,
  [togetherAiBlock.id]: togetherAiCredentialsSchema,
  [openRouterBlock.id]: openRouterCredentialsSchema,
  [nocodbBlock.id]: nocodbCredentialsSchema,
}
