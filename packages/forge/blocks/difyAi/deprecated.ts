import { option } from '@typebot.io/forge'

export const deprecatedCreateChatMessageOptions = option.object({
  conversation_id: option.string
    .layout({
      label: 'Conversation ID',
      moreInfoTooltip:
        'Used to remember the conversation with the user. If empty, a new conversation id is created.',
      isHidden: true,
    })
    .describe('Deprecated, use `conversationVariableId` instead'),
})
