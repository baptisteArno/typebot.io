import { BotContext, InitialChatReply } from '@/types'
import { guessApiHost } from '@/utils/guessApiHost'
import { isNotDefined, isNotEmpty } from '@typebot.io/lib'
import {
  getPaymentInProgressInStorage,
  removePaymentInProgressFromStorage,
} from '@/features/blocks/inputs/payment/helpers/paymentInProgressStorage'
import {
  StartChatInput,
  StartFrom,
  StartPreviewChatInput,
} from '@typebot.io/schemas'
import ky from 'ky'

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typebot: string | any
  stripeRedirectStatus?: string
  apiHost?: string
  startFrom?: StartFrom
  isPreview: boolean
  prefilledVariables?: Record<string, unknown>
  resultId?: string
}

export async function startChatQuery({
  typebot,
  isPreview,
  apiHost,
  prefilledVariables,
  resultId,
  stripeRedirectStatus,
  startFrom,
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
        .json<InitialChatReply>()

      return { data }
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
            } satisfies Omit<StartPreviewChatInput, 'typebotId'>,
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
    const data = await ky
      .post(
        `${
          isNotEmpty(apiHost) ? apiHost : guessApiHost()
        }/api/v1/typebots/${typebotId}/startChat`,
        {
          json: {
            isStreamEnabled: true,
            prefilledVariables,
            resultId,
            isOnlyRegistering: false,
          } satisfies Omit<StartChatInput, 'publicId'>,
          timeout: false,
        }
      )
      .json<InitialChatReply>()

    return { data }
  } catch (error) {
    return { error }
  }
}
