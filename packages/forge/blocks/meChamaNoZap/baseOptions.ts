import { option } from '@typebot.io/forge'

export const baseOptions = option.object({
  conversationId: option.string.layout({
    label: 'Conversation ID',
    isRequired: true,
    moreInfoTooltip: 'pode ser obtida através da variavel "conversationId"',
    helperText: 'Variavel com o ID da conversa',
  }),
})
