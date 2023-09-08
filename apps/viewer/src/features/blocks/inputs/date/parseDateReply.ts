import { ParsedReply } from '@/features/chat/types'
import { DateInputBlock } from '@typebot.io/schemas'
import { parse as chronoParse } from 'chrono-node'
import { format } from 'date-fns'

export const parseDateReply = (
  reply: string,
  block: DateInputBlock
): ParsedReply => {
  const parsedDate = chronoParse(reply)
  if (parsedDate.length === 0) return { status: 'fail' }
  const formatString =
    block.options.format ??
    (block.options.hasTime ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy')

  const detectedStartDate = parseDateWithNeutralTimezone(
    parsedDate[0].start.date()
  )
  const startDate = format(detectedStartDate, formatString)

  const detectedEndDate = parsedDate[0].end?.date()
    ? parseDateWithNeutralTimezone(parsedDate[0].end?.date())
    : undefined
  const endDate = detectedEndDate
    ? format(detectedEndDate, formatString)
    : undefined

  if (block.options.isRange && !endDate) return { status: 'fail' }

  if (
    block.options.max &&
    (detectedStartDate > new Date(block.options.max) ||
      (detectedEndDate && detectedEndDate > new Date(block.options.max)))
  )
    return { status: 'fail' }

  if (
    block.options.min &&
    (detectedStartDate < new Date(block.options.min) ||
      (detectedEndDate && detectedEndDate < new Date(block.options.min)))
  )
    return { status: 'fail' }

  return {
    status: 'success',
    reply: block.options.isRange ? `${startDate} to ${endDate}` : startDate,
  }
}

const parseDateWithNeutralTimezone = (date: Date) =>
  new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000)
