import { Anthropic } from '@anthropic-ai/sdk'
import { options as createMessageOptions } from '../actions/createChatMessage'
import { VariableStore } from '@typebot.io/forge'
import { isDefined, isEmpty } from '@typebot.io/lib'
import { z } from '@typebot.io/forge/zod'
import ky, { HTTPError } from 'ky'
import {
  defaultAnthropicOptions,
  modelsWithImageUrlSupport,
  supportedImageTypes,
} from '../constants'
import { wildcardMatch } from '@typebot.io/lib/wildcardMatch'

const isModelCompatibleWithImageUrls = (model: string | undefined) =>
  model ? wildcardMatch(modelsWithImageUrlSupport)(model) : false

export const parseChatMessages = async ({
  options: { messages, model },
  variables,
}: {
  options: Pick<z.infer<typeof createMessageOptions>, 'messages' | 'model'>
  variables: VariableStore
}): Promise<Anthropic.Messages.MessageParam[]> => {
  if (!messages) return []
  const isVisionEnabled = isModelCompatibleWithImageUrls(
    model ?? defaultAnthropicOptions.model
  )
  const parsedMessages = (
    await Promise.all(
      messages.map(async (message) => {
        if (!message.role) return

        if (message.role === 'Dialogue') {
          if (!message.dialogueVariableId) return
          const dialogue = variables.get(message.dialogueVariableId) ?? []
          const dialogueArr = Array.isArray(dialogue) ? dialogue : [dialogue]

          return Promise.all(
            dialogueArr.map(async (dialogueItem, index) => {
              if (index === 0 && message.startsBy === 'assistant')
                return {
                  role: 'assistant',
                  content: dialogueItem,
                }
              if (index % (message.startsBy === 'assistant' ? 1 : 2) === 0) {
                return {
                  role: 'user',
                  content: isVisionEnabled
                    ? await splitUserTextMessageIntoBlocks(dialogueItem ?? '')
                    : dialogueItem,
                }
              }
              return {
                role: 'assistant',
                content: dialogueItem,
              }
            })
          )
        }

        if (!message.content) return

        const content = variables.parse(message.content)

        if (isEmpty(content)) return

        if (message.role === 'user')
          return {
            role: 'user',
            content: isVisionEnabled
              ? await splitUserTextMessageIntoBlocks(content)
              : content,
          }

        return {
          role: message.role,
          content,
        }
      })
    )
  )
    .flat()
    .filter((message) => {
      return isDefined(message?.role) && isDefined(message.content)
    }) as Anthropic.Messages.MessageParam[]

  return parsedMessages
}

const splitUserTextMessageIntoBlocks = async (
  input: string
): Promise<
  | string
  | (Anthropic.Messages.TextBlockParam | Anthropic.Messages.ImageBlockParam)[]
> => {
  const urlRegex = /(^|\n\n)(https?:\/\/[^\s]+)(\n\n|$)/g
  const match = input.match(urlRegex)
  if (!match) return input
  const parts: (
    | Anthropic.Messages.TextBlockParam
    | Anthropic.Messages.ImageBlockParam
  )[] = []
  let processedInput = input

  for (const url of match) {
    const textBeforeUrl = processedInput.slice(0, processedInput.indexOf(url))
    if (textBeforeUrl.trim().length > 0) {
      parts.push({ type: 'text', text: textBeforeUrl })
    }
    const cleanUrl = url.trim()

    try {
      const response = await ky.get(cleanUrl)
      if (
        !response.ok ||
        !supportedImageTypes.includes(
          response.headers.get('content-type') as any
        )
      ) {
        parts.push({ type: 'text', text: cleanUrl })
      } else {
        parts.push({
          type: 'image',
          source: {
            data: Buffer.from(await response.arrayBuffer()).toString('base64'),
            type: 'base64',
            media_type: response.headers.get('content-type') as any,
          },
        })
      }
    } catch (err) {
      if (err instanceof HTTPError) {
        console.log(err.response.status, await err.response.text())
      } else {
        console.error(err)
      }
    }
    processedInput = processedInput.slice(
      processedInput.indexOf(url) + url.length
    )
  }

  if (processedInput.trim().length > 0) {
    parts.push({ type: 'text', text: processedInput })
  }

  return parts
}
