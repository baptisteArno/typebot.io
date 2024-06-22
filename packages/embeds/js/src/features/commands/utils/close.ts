import { CommandData } from '../types'

export const close = () => {
  const message: CommandData = {
    isFromSniper: true,
    command: 'close',
  }
  window.postMessage(message)
}
