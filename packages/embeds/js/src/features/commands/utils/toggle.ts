import { CommandData } from '../types'

export const toggle = () => {
  const message: CommandData = {
    isFromSniper: true,
    command: 'toggle',
  }
  window.postMessage(message)
}
