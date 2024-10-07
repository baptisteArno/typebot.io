import {
  getPaymentInProgressInStorage,
  removePaymentInProgressFromStorage,
} from "@/features/blocks/inputs/payment/helpers/paymentInProgressStorage";
import type { BotContext } from "@/types";
import { CorsError } from "@/utils/CorsError";
import { guessApiHost } from "@/utils/guessApiHost";
import type {
  ContinueChatResponse,
  StartChatInput,
  StartChatResponse,
  StartFrom,
  StartPreviewChatInput,
} from "@typebot.io/bot-engine/schemas/api";
import { isNotDefined, isNotEmpty } from "@typebot.io/lib/utils";
import ky from "ky";

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typebot: string | any;
  stripeRedirectStatus?: string;
  apiHost?: string;
  startFrom?: StartFrom;
  isPreview: boolean;
  prefilledVariables?: Record<string, unknown>;
  resultId?: string;
  sessionId?: string;
};

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
    throw new Error("Typebot ID is required to get initial messages");

  const paymentInProgressStateStr =
    getPaymentInProgressInStorage() ?? undefined;
  const paymentInProgressState = paymentInProgressStateStr
    ? (JSON.parse(paymentInProgressStateStr) as {
        sessionId: string;
        typebot: BotContext["typebot"];
      })
    : undefined;
  if (paymentInProgressState) {
    return resumeChatAfterPaymentRedirect({
      apiHost,
      stripeRedirectStatus,
      paymentInProgressState,
    });
  }
  const typebotId = typeof typebot === "string" ? typebot : typebot.id;
  if (isPreview) {
    return startPreviewChat({
      apiHost,
      typebotId,
      startFrom,
      typebot,
      prefilledVariables,
      sessionId,
    });
  }

  try {
    const iframeReferrerOrigin =
      parent !== window && isNotEmpty(document.referrer)
        ? new URL(document.referrer).origin
        : undefined;
    const response = await ky.post(
      `${getApiHost(apiHost)}/api/v1/typebots/${typebotId}/startChat`,
      {
        headers: {
          "x-typebot-iframe-referrer-origin": iframeReferrerOrigin,
        },
        json: {
          isStreamEnabled: true,
          prefilledVariables,
          resultId,
          isOnlyRegistering: false,
        } satisfies Omit<
          StartChatInput,
          "publicId" | "textBubbleContentFormat"
        >,
        timeout: false,
      },
    );

    const corsAllowOrigin = response.headers.get("access-control-allow-origin");

    if (
      iframeReferrerOrigin &&
      corsAllowOrigin &&
      corsAllowOrigin !== "*" &&
      !iframeReferrerOrigin.includes(corsAllowOrigin)
    )
      throw new CorsError(corsAllowOrigin);

    return { data: await response.json<StartChatResponse>() };
  } catch (error) {
    return { error };
  }
}

const resumeChatAfterPaymentRedirect = async ({
  apiHost,
  stripeRedirectStatus,
  paymentInProgressState,
}: {
  apiHost?: string;
  stripeRedirectStatus?: string;
  paymentInProgressState: {
    sessionId: string;
    typebot: BotContext["typebot"];
  };
}) => {
  removePaymentInProgressFromStorage();

  try {
    const data = await ky
      .post(
        `${getApiHost(apiHost)}/api/v1/sessions/${
          paymentInProgressState.sessionId
        }/continueChat`,
        {
          json: {
            message: stripeRedirectStatus === "failed" ? "fail" : "Success",
          },
          timeout: false,
        },
      )
      .json<ContinueChatResponse>();

    return {
      data: {
        ...data,
        ...paymentInProgressState,
      } as StartChatResponse,
    };
  } catch (error) {
    return { error };
  }
};

const startPreviewChat = async ({
  apiHost,
  typebotId,
  startFrom,
  typebot,
  prefilledVariables,
  sessionId,
}: {
  apiHost?: string;
  typebotId: string;
  startFrom?: StartFrom;
  typebot: StartPreviewChatInput["typebot"];
  prefilledVariables?: Record<string, unknown>;
  sessionId?: string;
}) => {
  try {
    const data = await ky
      .post(
        `${getApiHost(apiHost)}/api/v1/typebots/${typebotId}/preview/startChat`,
        {
          json: {
            isStreamEnabled: true,
            startFrom,
            typebot,
            prefilledVariables,
            sessionId,
          } satisfies Omit<
            StartPreviewChatInput,
            "typebotId" | "isOnlyRegistering" | "textBubbleContentFormat"
          >,
          timeout: false,
        },
      )
      .json<StartChatResponse>();

    return { data };
  } catch (error) {
    return { error };
  }
};

const getApiHost = (apiHost?: string): string =>
  isNotEmpty(apiHost) ? apiHost : guessApiHost();
