import { CommandData } from '../types'

export const open = () => {
  const message: CommandData = {
    isFromSniper: true,
    command: 'open',
  }
  window.postMessage(message)
}
