import { anthropicBlock } from '@typebot.io/anthropic-block'
import { anthropicCredentialsSchema } from '@typebot.io/anthropic-block/schemas'
import { calComBlock } from '@typebot.io/cal-com-block'
import { calComCredentialsSchema } from '@typebot.io/cal-com-block/schemas'
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
import { qrCodeBlock } from '@typebot.io/qrcode-block'
import { qrCodeCredentialsSchema } from '@typebot.io/qrcode-block/schemas'
import { togetherAiBlock } from '@typebot.io/together-ai-block'
import { togetherAiCredentialsSchema } from '@typebot.io/together-ai-block/schemas'
import { zemanticAiBlock } from '@typebot.io/zemantic-ai-block'
import { zemanticAiCredentialsSchema } from '@typebot.io/zemantic-ai-block/schemas'

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
}
