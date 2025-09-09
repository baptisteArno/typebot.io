import { startSession } from "@typebot.io/bot-engine/startSession";
import type {
  ContinueChatResponse,
  Message,
} from "@typebot.io/chat-api/schemas";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import {
  ComparisonOperators,
  LogicalOperator,
} from "@typebot.io/conditions/constants";
import type { WhatsAppCredentials } from "@typebot.io/credentials/schemas";
import { isNotDefined } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import type { Prisma } from "@typebot.io/prisma/types";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { defaultSessionExpiryTimeout } from "@typebot.io/settings/constants";
import type { Settings } from "@typebot.io/settings/schemas";
import type { PublicTypebot } from "@typebot.io/typebot/schemas/publicTypebot";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import type { SetVariableHistoryItem } from "@typebot.io/variables/schemas";
import type { WhatsAppMessageReferral } from "./schemas";
import { WhatsAppError } from "./WhatsAppError";

type Props = {
  incomingMessage?: Message;
  workspaceId: string;
  credentials: WhatsAppCredentials["data"] & Pick<WhatsAppCredentials, "id">;
  contact: NonNullable<SessionState["whatsApp"]>["contact"];
  referral?: WhatsAppMessageReferral;
  sessionStore: SessionStore;
};

export const startWhatsAppSession = async ({
  incomingMessage,
  workspaceId,
  credentials,
  contact,
  referral,
  sessionStore,
}: Props): Promise<
  ContinueChatResponse & {
    newSessionState: SessionState;
    visitedEdges: Prisma.VisitedEdge[];
    setVariableHistory: SetVariableHistoryItem[];
  }
> => {
  const publicTypebotsWithWhatsAppEnabled =
    (await prisma.publicTypebot.findMany({
      where: {
        typebot: { workspaceId, whatsAppCredentialsId: credentials.id },
      },
      select: {
        settings: true,
        typebot: {
          select: {
            publicId: true,
          },
        },
      },
    })) as (Pick<PublicTypebot, "settings"> & {
      typebot: Pick<Typebot, "publicId">;
    })[];

  const botsWithWhatsAppEnabled = publicTypebotsWithWhatsAppEnabled.filter(
    (publicTypebot) =>
      publicTypebot.typebot.publicId &&
      publicTypebot.settings.whatsApp?.isEnabled,
  );

  const publicTypebotWithMatchedCondition = botsWithWhatsAppEnabled.find(
    (publicTypebot) =>
      (publicTypebot.settings.whatsApp?.startCondition?.comparisons.length ??
        0) > 0 &&
      messageMatchStartCondition(
        incomingMessage ?? { type: "text", text: "" },
        publicTypebot.settings.whatsApp?.startCondition,
      ),
  );

  const publicTypebot =
    publicTypebotWithMatchedCondition ??
    botsWithWhatsAppEnabled.find(
      (publicTypebot) => !publicTypebot.settings.whatsApp?.startCondition,
    );

  if (isNotDefined(publicTypebot)) {
    if (botsWithWhatsAppEnabled.length > 0)
      throw new WhatsAppError("Message did not matched any condition");
    throw new WhatsAppError(
      "No public typebot with WhatsApp integration found",
    );
  }

  const sessionExpiryTimeoutHours =
    publicTypebot.settings.whatsApp?.sessionExpiryTimeout ??
    defaultSessionExpiryTimeout;

  return startSession({
    version: 2,
    startParams: {
      type: "live",
      publicId: publicTypebot.typebot.publicId as string,
      isOnlyRegistering: false,
      isStreamEnabled: false,
      textBubbleContentFormat: "richText",
      message: incomingMessage,
    },
    initialSessionState: {
      whatsApp: {
        contact,
        referral: referral
          ? {
              sourceId: referral.source_id,
              ctwaClickId: referral.ctwa_clid,
            }
          : undefined,
      },
      expiryTimeout: sessionExpiryTimeoutHours * 60 * 60 * 1000,
    },
    sessionStore,
  });
};

export const messageMatchStartCondition = (
  message: Message | undefined,
  startCondition: NonNullable<Settings["whatsApp"]>["startCondition"],
) => {
  if (!startCondition) return true;
  if (message?.type !== "text" || !message.text) return false;
  return (startCondition.logicalOperator ?? LogicalOperator.AND) ===
    LogicalOperator.AND
    ? startCondition.comparisons.every((comparison) =>
        matchComparison(
          message.text,
          comparison.comparisonOperator,
          comparison.value,
        ),
      )
    : startCondition.comparisons.some((comparison) =>
        matchComparison(
          message.text,
          comparison.comparisonOperator,
          comparison.value,
        ),
      );
};

const matchComparison = (
  inputValue: string,
  comparisonOperator?: ComparisonOperators,
  value?: string,
): boolean | undefined => {
  if (!comparisonOperator) return false;
  switch (comparisonOperator) {
    case ComparisonOperators.CONTAINS: {
      if (!value) return false;
      return inputValue
        .trim()
        .toLowerCase()
        .includes(value.trim().toLowerCase());
    }
    case ComparisonOperators.EQUAL: {
      return inputValue === value;
    }
    case ComparisonOperators.NOT_EQUAL: {
      return inputValue !== value;
    }
    case ComparisonOperators.GREATER: {
      if (!value) return false;
      return Number.parseFloat(inputValue) > Number.parseFloat(value);
    }
    case ComparisonOperators.LESS: {
      if (!value) return false;
      return Number.parseFloat(inputValue) < Number.parseFloat(value);
    }
    case ComparisonOperators.IS_SET: {
      return inputValue.length > 0;
    }
    case ComparisonOperators.IS_EMPTY: {
      return inputValue.length === 0;
    }
    case ComparisonOperators.STARTS_WITH: {
      if (!value) return false;
      return inputValue.toLowerCase().startsWith(value.toLowerCase());
    }
    case ComparisonOperators.ENDS_WITH: {
      if (!value) return false;
      return inputValue.toLowerCase().endsWith(value.toLowerCase());
    }
    case ComparisonOperators.NOT_CONTAINS: {
      if (!value) return false;
      return !inputValue
        .trim()
        .toLowerCase()
        .includes(value.trim().toLowerCase());
    }
  }
};
