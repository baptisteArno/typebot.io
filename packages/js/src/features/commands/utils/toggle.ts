import { CommandData } from '../types'

export const toggle = () => {
  const message: CommandData = {
    isFromTypebot: true,
    command: 'toggle',
  }
  window.postMessage(message)
}
