import { CommandData } from '../types'

export const unmount = () => {
  const message: CommandData = {
    isFromSniper: true,
    command: 'unmount',
  }
  window.postMessage(message)
}
