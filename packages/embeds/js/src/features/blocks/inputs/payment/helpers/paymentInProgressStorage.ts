import { BotContext } from '@/types'

export const setPaymentInProgressInStorage = (state: {
  sessionId: string
  typebot: BotContext['typebot']
}) => {
  sessionStorage.setItem('typebotPaymentInProgress', JSON.stringify(state))
}

export const getPaymentInProgressInStorage = () =>
  sessionStorage.getItem('typebotPaymentInProgress')

export const removePaymentInProgressFromStorage = () => {
  sessionStorage.removeItem('typebotPaymentInProgress')
}
