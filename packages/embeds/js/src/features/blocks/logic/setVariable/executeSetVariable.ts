import type { ScriptToExecute } from '@typebot.io/schemas'
import { safeStringify } from '@typebot.io/lib/safeStringify'

// eslint-disable-next-line @typescript-eslint/no-empty-function
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor

export const executeSetVariable = async ({
  content,
  args,
}: ScriptToExecute): Promise<{ replyToSend: string | undefined }> => {
  try {
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
    }
  }
}
