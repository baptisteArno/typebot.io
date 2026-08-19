import type {
  ContinueChatResponse,
  StartChatInput,
  StartChatResponse,
  StartFrom,
  StartPreviewChatInput,
} from "@typebot.io/chat-api/schemas";
import { isNotDefined, isNotEmpty } from "@typebot.io/lib/utils";
import ky from "ky";
import {
  getPaymentInProgressInStorage,
  removePaymentInProgressFromStorage,
} from "../features/blocks/inputs/payment/helpers/paymentInProgressStorage";
import type { BotContext } from "../types";
import { getIframeReferrerOrigin } from "../utils/getIframeReferrerOrigin";
import { guessApiHost } from "../utils/guessApiHost";

type Props = {
  typebot?: string;
  templateSlug?: string;
  stripeRedirectStatus?: string;
  apiHost?: string;
  startFrom?: StartFrom;
  isPreview: boolean;
  isProgressBarEnabled?: boolean;
  prefilledVariables?: Record<string, unknown>;
  resultId?: string;
  sessionId?: string;
};

export async function startChatQuery({
  typebot,
  templateSlug,
  isPreview,
  isProgressBarEnabled,
  apiHost,
  prefilledVariables,
  resultId,
  stripeRedirectStatus,
  startFrom,
  sessionId,
}: Props) {
  if (isNotDefined(typebot) && !isNotEmpty(templateSlug))
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
  if (isNotEmpty(templateSlug)) {
    return startTemplatePreviewChat({
      apiHost,
      templateSlug,
      startFrom,
      prefilledVariables,
      sessionId,
    });
  }

  if (isNotDefined(typebot))
    throw new Error("Typebot ID is required to get initial messages");

  if (isPreview) {
    return startPreviewChat({
      apiHost,
      typebotId: typebot,
      startFrom,
      prefilledVariables,
      sessionId,
      isProgressBarEnabled,
    });
  }

  try {
    const iframeReferrerOrigin = getIframeReferrerOrigin();
    const response = await ky.post(
      `${getApiHost(apiHost)}/api/v1/typebots/${typebot}/startChat`,
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
    const iframeReferrerOrigin = getIframeReferrerOrigin();
    const data = await ky
      .post(
        `${getApiHost(apiHost)}/api/v1/sessions/${
          paymentInProgressState.sessionId
        }/continueChat`,
        {
          headers: {
            "x-typebot-iframe-referrer-origin": iframeReferrerOrigin,
          },
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
  prefilledVariables,
  sessionId,
  isProgressBarEnabled,
}: {
  apiHost?: string;
  typebotId: string;
  startFrom?: StartFrom;
  prefilledVariables?: Record<string, unknown>;
  sessionId?: string;
  isProgressBarEnabled?: boolean;
}) => {
  try {
    const data = await ky
      .post(
        `${getApiHost(apiHost)}/api/v1/typebots/${typebotId}/preview/startChat`,
        {
          json: {
            isStreamEnabled: true,
            startFrom,
            prefilledVariables,
            sessionId,
            isProgressBarEnabled,
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

const startTemplatePreviewChat = async ({
  apiHost,
  templateSlug,
  startFrom,
  prefilledVariables,
  sessionId,
}: {
  apiHost?: string;
  templateSlug: string;
  startFrom?: StartFrom;
  prefilledVariables?: Record<string, unknown>;
  sessionId?: string;
}) => {
  try {
    const data = await ky
      .post(
        `${getApiHost(
          apiHost,
        )}/api/v1/templates/${templateSlug}/preview/startChat`,
        {
          json: {
            isStreamEnabled: true,
            startFrom,
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
