import { BotContext, InitialChatReply } from '@/types'
import { guessApiHost } from '@/utils/guessApiHost'
import { isNotDefined, isNotEmpty, sendRequest } from '@typebot.io/lib'
import {
  getPaymentInProgressInStorage,
  removePaymentInProgressFromStorage,
} from '@/features/blocks/inputs/payment/helpers/paymentInProgressStorage'
import {
  StartChatInput,
  StartFrom,
  StartPreviewChatInput,
} from '@typebot.io/schemas'

export async function startChatQuery({
  typebot,
  isPreview,
  apiHost,
  prefilledVariables,
  resultId,
  stripeRedirectStatus,
  startFrom,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typebot: string | any
  stripeRedirectStatus?: string
  apiHost?: string
  startFrom?: StartFrom
  isPreview: boolean
  prefilledVariables?: Record<string, unknown>
  resultId?: string
}) {
  if (isNotDefined(typebot))
    throw new Error('Typebot ID is required to get initial messages')

  const paymentInProgressStateStr = getPaymentInProgressInStorage() ?? undefined
  const paymentInProgressState = paymentInProgressStateStr
    ? (JSON.parse(paymentInProgressStateStr) as {
        sessionId: string
        typebot: BotContext['typebot']
      })
    : undefined
  if (paymentInProgressState) {
    removePaymentInProgressFromStorage()
    const { data, error } = await sendRequest<InitialChatReply>({
      method: 'POST',
      url: `${isNotEmpty(apiHost) ? apiHost : guessApiHost()}/api/v1/sessions/${
        paymentInProgressState.sessionId
      }/continueChat`,
      body: {
        message: paymentInProgressState
          ? stripeRedirectStatus === 'failed'
            ? 'fail'
            : 'Success'
          : undefined,
      },
    })
    return {
      data: data
        ? {
            ...data,
            ...(paymentInProgressState
              ? { typebot: paymentInProgressState.typebot }
              : {}),
          }
        : undefined,
      error,
    }
  }
  const typebotId = typeof typebot === 'string' ? typebot : typebot.id
  if (isPreview) {
    const { data, error } = await sendRequest<InitialChatReply>({
      method: 'POST',
      url: `${
        isNotEmpty(apiHost) ? apiHost : guessApiHost()
      }/api/v1/typebots/${typebotId}/preview/startChat`,
      body: {
        isStreamEnabled: true,
        startFrom,
        typebot,
      } satisfies Omit<StartPreviewChatInput, 'typebotId'>,
    })
    return {
      data,
      error,
    }
  }

  const { data, error } = await sendRequest<InitialChatReply>({
    method: 'POST',
    url: `${
      isNotEmpty(apiHost) ? apiHost : guessApiHost()
    }/api/v1/typebots/${typebotId}/startChat`,
    body: {
      isStreamEnabled: true,
      prefilledVariables,
      resultId,
    } satisfies Omit<StartChatInput, 'publicId'>,
  })

  return {
    data,
    error,
  }
}
