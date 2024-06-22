import { option } from '@typebot.io/forge'

export const deprecatedAskAssistantOptions = option.object({
  threadId: option.string.layout({
    label: 'Thread ID',
    moreInfoTooltip:
      'Used to remember the conversation with the user. If empty, a new thread is created.',
    isHidden: true,
  }),
})
