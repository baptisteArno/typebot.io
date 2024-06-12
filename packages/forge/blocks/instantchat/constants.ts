export const defaultInstantchatOptions = {
  baseKwikUrl: 'https://kwik.app.br/',
} as const

export const defaultCortexOptions = {
  initialMessage:
    'Me diga o que você deseja. A qualquer momento, para sair digite #fim, ou #atendimento para ser transferido para um humano.',
  endCmd: '#fim',
  agentCmd: '#atendimento',
  retries: 3,
} as const
