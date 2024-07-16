import type { ChatLog, ScriptToExecute } from '@typebot.io/schemas'
import { safeStringify } from '@typebot.io/lib/safeStringify'
import { stringifyError } from '@typebot.io/lib/stringifyError'

// eslint-disable-next-line @typescript-eslint/no-empty-function
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor

export const executeSetVariable = async ({
  content,
  args,
  isCode,
}: ScriptToExecute): Promise<{
  replyToSend: string | undefined
  logs?: ChatLog[]
}> => {
  try {
    // To avoid octal number evaluation
    if (!isNaN(content as unknown as number) && /0[^.].+/.test(content))
      return {
        replyToSend: content,
      }
    const func = AsyncFunction(
      ...args.map((arg) => arg.id),
      content.includes('return ') ? content : `return ${content}`
    )
    const replyToSend = await func(...args.map((arg) => arg.value))
    return {
      replyToSend: safeStringify(replyToSend) ?? undefined,
    }
  } catch (err) {
    console.error(err)
    return {
      replyToSend: safeStringify(content) ?? undefined,
      logs: isCode
        ? [
            {
              status: 'error',
              description: 'Failed to execute Set Variable code',
              details: stringifyError(err),
            },
          ]
        : undefined,
    }
  }
}
