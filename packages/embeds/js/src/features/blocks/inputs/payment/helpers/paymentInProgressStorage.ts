import { StartChatResponse } from '@typebot.io/schemas'

export const setPaymentInProgressInStorage = (
  state: Pick<StartChatResponse, 'typebot' | 'sessionId' | 'resultId'>
) => {
  sessionStorage.setItem('typebotPaymentInProgress', JSON.stringify(state))
}

export const getPaymentInProgressInStorage = () =>
  sessionStorage.getItem('typebotPaymentInProgress')

export const removePaymentInProgressFromStorage = () => {
  sessionStorage.removeItem('typebotPaymentInProgress')
}
