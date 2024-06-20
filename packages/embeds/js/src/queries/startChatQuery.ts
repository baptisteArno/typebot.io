import { BotContext, InitialChatReply } from '@/types'
import { guessApiHost } from '@/utils/guessApiHost'
import { isNotDefined, isNotEmpty } from '@sniper.io/lib'
import {
  getPaymentInProgressInStorage,
  removePaymentInProgressFromStorage,
} from '@/features/blocks/inputs/payment/helpers/paymentInProgressStorage'
import {
  StartChatInput,
  StartFrom,
  StartPreviewChatInput,
} from '@sniper.io/schemas'
import ky from 'ky'
import { CorsError } from '@/utils/CorsError'

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sniper: string | any
  stripeRedirectStatus?: string
  apiHost?: string
  startFrom?: StartFrom
  isPreview: boolean
  prefilledVariables?: Record<string, unknown>
  resultId?: string
  sessionId?: string
}

export async function startChatQuery({
  sniper,
  isPreview,
  apiHost,
  prefilledVariables,
  resultId,
  stripeRedirectStatus,
  startFrom,
  sessionId,
}: Props) {
  if (isNotDefined(sniper))
    throw new Error('Sniper ID is required to get initial messages')

  const paymentInProgressStateStr = getPaymentInProgressInStorage() ?? undefined
  const paymentInProgressState = paymentInProgressStateStr
    ? (JSON.parse(paymentInProgressStateStr) as {
        sessionId: string
        sniper: BotContext['sniper']
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
        .json<InitialChatReply>()

      return { data }
    } catch (error) {
      return { error }
    }
  }
  const sniperId = typeof sniper === 'string' ? sniper : sniper.id
  if (isPreview) {
    try {
      const data = await ky
        .post(
          `${
            isNotEmpty(apiHost) ? apiHost : guessApiHost()
          }/api/v1/snipers/${sniperId}/preview/startChat`,
          {
            json: {
              isStreamEnabled: true,
              startFrom,
              sniper,
              prefilledVariables,
              sessionId,
            } satisfies Omit<
              StartPreviewChatInput,
              'sniperId' | 'isOnlyRegistering' | 'textBubbleContentFormat'
            >,
            timeout: false,
          }
        )
        .json<InitialChatReply>()

      return { data }
    } catch (error) {
      return { error }
    }
  }

  try {
    const iframeReferrerOrigin =
      parent !== window ? new URL(document.referrer).origin : undefined
    const response = await ky.post(
      `${
        isNotEmpty(apiHost) ? apiHost : guessApiHost()
      }/api/v1/snipers/${sniperId}/startChat`,
      {
        headers: {
          'x-sniper-iframe-referrer-origin': iframeReferrerOrigin,
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

    return { data: await response.json<InitialChatReply>() }
  } catch (error) {
    return { error }
  }
}
