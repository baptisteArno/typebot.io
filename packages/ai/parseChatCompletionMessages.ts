import { CoreAssistantMessage, CoreMessage, CoreUserMessage } from 'ai'
import { VariableStore } from '@typebot.io/forge'
import { isDefined, isEmpty } from '@typebot.io/lib'
import { splitUserTextMessageIntoBlocks } from './splitUserTextMessageIntoBlocks'
import { Message, StandardMessage, DialogueMessage } from './types'

type Props = {
  messages: Message[] | undefined
  isVisionEnabled: boolean
  shouldDownloadImages: boolean
  variables: VariableStore
}

export const parseChatCompletionMessages = async ({
  messages,
  isVisionEnabled,
  shouldDownloadImages,
  variables,
}: Props): Promise<CoreMessage[]> => {
  if (!messages) return []
  const parsedMessages: CoreMessage[] = (
    await Promise.all(
      messages.map(async (message) => {
        if (!message.role) return

        if (message.role === 'Dialogue')
          return parseDialogueMessage({
            message,
            variables,
            isVisionEnabled,
            shouldDownloadImages,
          })

        return parseStandardMessage({
          message,
          variables,
          isVisionEnabled,
          shouldDownloadImages,
        })
      })
    )
  )
    .flat()
    .filter(isDefined)

  return parsedMessages
}

const parseDialogueMessage = async ({
  message,
  variables,
  isVisionEnabled,
  shouldDownloadImages,
}: Pick<Props, 'variables' | 'isVisionEnabled' | 'shouldDownloadImages'> & {
  message: DialogueMessage
}) => {
  if (!message.dialogueVariableId) return
  const dialogue = variables.get(message.dialogueVariableId) ?? []
  const dialogueArr = Array.isArray(dialogue) ? dialogue : [dialogue]

  return Promise.all(
    dialogueArr.map<
      Promise<CoreUserMessage | CoreAssistantMessage | undefined>
    >(async (dialogueItem, index) => {
      if (!dialogueItem) return
      if (index === 0 && message.startsBy === 'assistant')
        return { role: 'assistant' as const, content: dialogueItem }
      if (index % (message.startsBy === 'assistant' ? 1 : 2) === 0) {
        return {
          role: 'user' as const,
          content: isVisionEnabled
            ? await splitUserTextMessageIntoBlocks({
                input: dialogueItem ?? '',
                shouldDownloadImages,
              })
            : dialogueItem,
        }
      }
      return { role: 'assistant' as const, content: dialogueItem }
    })
  )
}

const parseStandardMessage = async ({
  message,
  variables,
  isVisionEnabled,
  shouldDownloadImages,
}: Pick<Props, 'variables' | 'isVisionEnabled' | 'shouldDownloadImages'> & {
  message: StandardMessage
}) => {
  if (!message.content) return

  const content = variables.parse(message.content)

  if (isEmpty(content)) return

  if (message.role === 'user')
    return {
      role: 'user' as const,
      content: isVisionEnabled
        ? await splitUserTextMessageIntoBlocks({
            input: content,
            shouldDownloadImages,
          })
        : content,
    }

  return {
    role: message.role,
    content,
  }
}
