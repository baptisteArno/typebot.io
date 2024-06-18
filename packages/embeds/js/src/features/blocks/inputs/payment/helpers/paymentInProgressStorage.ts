import { BotContext } from '@/types'

export const setPaymentInProgressInStorage = (state: {
  sessionId: string
  sniper: BotContext['sniper']
}) => {
  sessionStorage.setItem('sniperPaymentInProgress', JSON.stringify(state))
}

export const getPaymentInProgressInStorage = () =>
  sessionStorage.getItem('sniperPaymentInProgress')

export const removePaymentInProgressFromStorage = () => {
  sessionStorage.removeItem('sniperPaymentInProgress')
}
