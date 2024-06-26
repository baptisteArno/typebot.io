import { BotContext } from '@/types'
import { guessApiHost } from '@/utils/guessApiHost'
import { isNotDefined, isNotEmpty } from '@typebot.io/lib'
import {
  getPaymentInProgressInStorage,
  removePaymentInProgressFromStorage,
} from '@/features/blocks/inputs/payment/helpers/paymentInProgressStorage'
import {
  ContinueChatResponse,
  StartChatInput,
  StartChatResponse,
  StartFrom,
  StartPreviewChatInput,
} from '@typebot.io/schemas'
import ky from 'ky'
import { CorsError } from '@/utils/CorsError'

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typebot: string | any
  stripeRedirectStatus?: string
  apiHost?: string
  startFrom?: StartFrom
  isPreview: boolean
  prefilledVariables?: Record<string, unknown>
  resultId?: string
  sessionId?: string
}

export async function startChatQuery({
  typebot,
  isPreview,
  apiHost,
  prefilledVariables,
  resultId,
  stripeRedirectStatus,
  startFrom,
  sessionId,
}: Props) {
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

    try {
      const data = await ky
        .post(
          `${isNotEmpty(apiHost) ? apiHost : guessApiHost()}/api/v1/sessions/${
            paymentInProgressState.sessionId
          }/continueChat`,
          {
            json: {
              message: paymentInProgressState
                ? stripeRedirectStatus === 'failed'
                  ? 'fail'
                  : 'Success'
                : undefined,
            },
            timeout: false,
          }
        )
        .json<ContinueChatResponse>()

      return {
        data: {
          ...data,
          ...paymentInProgressState,
        } satisfies StartChatResponse,
      }
    } catch (error) {
      return { error }
    }
  }
  const typebotId = typeof typebot === 'string' ? typebot : typebot.id
  if (isPreview) {
    try {
      const data = await ky
        .post(
          `${
            isNotEmpty(apiHost) ? apiHost : guessApiHost()
          }/api/v1/typebots/${typebotId}/preview/startChat`,
          {
            json: {
              isStreamEnabled: true,
              startFrom,
              typebot,
              prefilledVariables,
              sessionId,
            } satisfies Omit<
              StartPreviewChatInput,
              'typebotId' | 'isOnlyRegistering' | 'textBubbleContentFormat'
            >,
            timeout: false,
          }
        )
        .json<StartChatResponse>()

      return { data }
    } catch (error) {
      return { error }
    }
  }

  try {
    const iframeReferrerOrigin =
      parent !== window && isNotEmpty(document.referrer)
        ? new URL(document.referrer).origin
        : undefined
    const response = await ky.post(
      `${
        isNotEmpty(apiHost) ? apiHost : guessApiHost()
      }/api/v1/typebots/${typebotId}/startChat`,
      {
        headers: {
          'x-typebot-iframe-referrer-origin': iframeReferrerOrigin,
        },
        json: {
          isStreamEnabled: true,
          prefilledVariables,
          resultId,
          isOnlyRegistering: false,
        } satisfies Omit<
          StartChatInput,
          'publicId' | 'textBubbleContentFormat'
        >,
        timeout: false,
      }
    )

    const corsAllowOrigin = response.headers.get('access-control-allow-origin')

    if (
      iframeReferrerOrigin &&
      corsAllowOrigin &&
      corsAllowOrigin !== '*' &&
      !iframeReferrerOrigin.includes(corsAllowOrigin)
    )
      throw new CorsError(corsAllowOrigin)

    return { data: await response.json<StartChatResponse>() }
  } catch (error) {
    return { error }
  }
}
