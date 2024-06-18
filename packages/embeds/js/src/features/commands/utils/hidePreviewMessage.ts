import { CommandData } from '../types'

export const hidePreviewMessage = () => {
  const message: CommandData = {
    isFromSniper: true,
    command: 'hidePreviewMessage',
  }
  window.postMessage(message)
}
