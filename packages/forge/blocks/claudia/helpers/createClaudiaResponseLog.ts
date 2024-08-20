import { LogsStore } from '@typebot.io/forge'

type ClaudiaAction = 'END_FLOW' | 'FORWARD_TO_HUMAN' | 'CLOSE_TICKET'

type ClaudiaResponse = {
  action: ClaudiaAction
  topic?: string
}

type TypebotLog = Extract<
  Parameters<LogsStore['add']>[0],
  { description: string }
>

export const createClaudiaResponseLog = (
  response: ClaudiaResponse
): TypebotLog => ({
  status: 'success',
  description: 'Claudia Response',
  details: response,
})
