import { ParsedReply } from '@/features/chat/types'
import { DateInputBlock } from '@typebot.io/schemas'
import { parse as chronoParse } from 'chrono-node'

export const parseDateReply = (
  reply: string,
  block: DateInputBlock
): ParsedReply => {
  const parsedDate = chronoParse(reply)
  if (parsedDate.length === 0) return { status: 'fail' }
  const formatOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: block.options.hasTime ? '2-digit' : undefined,
    minute: block.options.hasTime ? '2-digit' : undefined,
  }
  const startDate = parsedDate[0].start
    .date()
    .toLocaleString(undefined, formatOptions)
  const endDate = parsedDate[0].end
    ?.date()
    .toLocaleString(undefined, formatOptions)
  return {
    status: 'success',
    reply: block.options.isRange ? `${startDate} to ${endDate}` : startDate,
  }
}
