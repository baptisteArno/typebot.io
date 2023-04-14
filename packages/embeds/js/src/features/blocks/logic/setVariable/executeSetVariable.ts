import { isNotDefined } from '@typebot.io/lib'
import type { ScriptToExecute } from '@typebot.io/schemas'

export const executeSetVariable = async ({
  content,
  args,
}: ScriptToExecute): Promise<{ replyToSend: string | undefined }> => {
  try {
    const func = Function(
      ...args.map((arg) => arg.id),
      content.includes('return ') ? content : `return ${content}`
    )
    const replyToSend = await func(...args.map((arg) => arg.value))
    return {
      replyToSend: safeStringify(replyToSend),
    }
  } catch (err) {
    return {
      replyToSend: safeStringify(content),
    }
  }
}

export const safeStringify = (val: unknown): string | undefined => {
  if (isNotDefined(val)) return
  if (typeof val === 'string') return val
  try {
    return JSON.stringify(val)
  } catch {
    console.warn('Failed to safely stringify variable value', val)
    return
  }
}
