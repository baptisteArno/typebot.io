import type { ScriptToExecute } from 'models'

export const executeScript = async ({ content, args }: ScriptToExecute) => {
  const func = Function(...args.map((arg) => arg.id), content)
  try {
    await func(...args.map((arg) => arg.value))
  } catch (err) {
    console.error(err)
  }
}
