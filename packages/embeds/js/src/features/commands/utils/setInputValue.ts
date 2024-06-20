import { CommandData } from '../types'

export const setInputValue = (value: string) => {
  const message: CommandData = {
    isFromSniper: true,
    command: 'setInputValue',
    value,
  }
  window.postMessage(message)
}
