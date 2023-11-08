import { BotContext, InitialChatReply } from '@/types'
import { guessApiHost } from '@/utils/guessApiHost'
import type {
  SendMessageInput,
  StartElementId,
  StartParams,
} from '@typebot.io/schemas'
import { isNotDefined, isNotEmpty, sendRequest } from '@typebot.io/lib'
import {
  getPaymentInProgressInStorage,
  removePaymentInProgressFromStorage,
} from '@/features/blocks/inputs/payment/helpers/paymentInProgressStorage'

export async function getInitialChatReplyQuery({
  typebot,
  isPreview,
  apiHost,
  prefilledVariables,
  resultId,
  stripeRedirectStatus,
  ...props
}: StartParams & {
  stripeRedirectStatus?: string
  apiHost?: string
} & StartElementId) {
  if (isNotDefined(typebot))
    throw new Error('Typebot ID is required to get initial messages')

  const paymentInProgressStateStr = getPaymentInProgressInStorage() ?? undefined
  const paymentInProgressState = paymentInProgressStateStr
    ? (JSON.parse(paymentInProgressStateStr) as {
        sessionId: string
        typebot: BotContext['typebot']
      })
    : undefined
  if (paymentInProgressState) removePaymentInProgressFromStorage()
  const { data, error } = await sendRequest<InitialChatReply>({
    method: 'POST',
    url: `${isNotEmpty(apiHost) ? apiHost : guessApiHost()}/api/v2/sendMessage`,
    body: {
      startParams: paymentInProgressState
        ? undefined
        : {
            isPreview,
            typebot,
            prefilledVariables,
            resultId,
            isStreamEnabled: true,
            startGroupId:
              'startGroupId' in props ? props.startGroupId : undefined,
            startEventId:
              'startEventId' in props ? props.startEventId : undefined,
          },
      sessionId: paymentInProgressState?.sessionId,
      message: paymentInProgressState
        ? stripeRedirectStatus === 'failed'
          ? 'fail'
          : 'Success'
        : undefined,
    } satisfies SendMessageInput,
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
