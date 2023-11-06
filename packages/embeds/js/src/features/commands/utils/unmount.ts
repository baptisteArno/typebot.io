import { CommandData } from '../types'

export const unmount = () => {
  const message: CommandData = {
    isFromTypebot: true,
    command: 'unmount',
  }
  window.postMessage(message)
}
