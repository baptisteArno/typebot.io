import type { ScriptToExecute } from '@typebot.io/schemas'

// eslint-disable-next-line @typescript-eslint/no-empty-function
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor

export const executeScript = async ({ content, args }: ScriptToExecute) => {
  try {
    const func = AsyncFunction(
      ...args.map((arg) => arg.id),
      parseContent(content)
    )
    await func(...args.map((arg) => arg.value))
  } catch (err) {
    console.warn('Script threw an error:', err)
  }
}

const parseContent = (content: string) => {
  const contentWithoutScriptTags = content
    .replace(/<script>/g, '')
    .replace(/<\/script>/g, '')
  return contentWithoutScriptTags
}
