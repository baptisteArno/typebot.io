import { CodeToExecute } from 'models'

export const executeCode = async ({ content, args }: CodeToExecute) => {
  const func = Function(...args.map((arg) => arg.id), content)
  try {
    await func(...args.map((arg) => arg.value))
  } catch (err) {
    console.error(err)
  }
}
