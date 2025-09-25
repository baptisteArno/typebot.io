import { createId } from "@paralleldrive/cuid2";
import * as Sentry from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import { isInputBlock } from "@typebot.io/blocks-core/helpers";
import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import { IntegrationBlockType } from "@typebot.io/blocks-integrations/constants";
import type { GoogleAnalyticsBlock } from "@typebot.io/blocks-integrations/googleAnalytics/schema";
import type { PixelBlock } from "@typebot.io/blocks-integrations/pixel/schema";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import {
  type StartChatInput,
  type StartChatResponse,
  type StartPreviewChatInput,
  type StartTypebot,
  type StartTypebotV6,
  startTypebotSchema,
} from "@typebot.io/chat-api/schemas";
import type {
  SessionState,
  TypebotInSession,
  TypebotInSessionV5,
} from "@typebot.io/chat-session/schemas";
import { env } from "@typebot.io/env";
import { byId, isDefined, isNotEmpty, omit } from "@typebot.io/lib/utils";
import type { Prisma } from "@typebot.io/prisma/types";
import { resultSchema } from "@typebot.io/results/schemas/results";
import { parseVariablesInRichText } from "@typebot.io/rich-text/parseVariablesInRichText";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import {
  defaultSettings,
  defaultSystemMessages,
} from "@typebot.io/settings/constants";
import { settingsSchema } from "@typebot.io/settings/schemas";
import {
  defaultGuestAvatarIsEnabled,
  defaultHostAvatarIsEnabled,
} from "@typebot.io/theme/constants";
import type { Theme } from "@typebot.io/theme/schemas";
import { deepParseVariables } from "@typebot.io/variables/deepParseVariables";
import { injectVariableValues } from "@typebot.io/variables/injectVariableValues";
import {
  getVariablesToParseInfoInText,
  parseVariables,
} from "@typebot.io/variables/parseVariables";
import type {
  SetVariableHistoryItem,
  Variable,
} from "@typebot.io/variables/schemas";
import { transformPrefilledVariablesToVariables } from "@typebot.io/variables/transformPrefilledVariablesToVariables";
import { NodeType, parse } from "node-html-parser";
import { getStartingPoint } from "./getStartingPoint";
import { isTypebotInSessionAtLeastV6 } from "./helpers/isTypebotInSessionAtLeastV6";
import { parseDynamicTheme } from "./parseDynamicTheme";
import { findPublicTypebot } from "./queries/findPublicTypebot";
import { findResult } from "./queries/findResult";
import { findTypebot } from "./queries/findTypebot";
import { startBotFlow } from "./startBotFlow";
import { updateVariablesInSession } from "./updateVariablesInSession";
import type { WalkFlowStartingPoint } from "./walkFlowForward";

type StartParams =
  | ({
      type: "preview";
      userId?: string;
    } & StartPreviewChatInput)
  | ({
      type: "live";
    } & StartChatInput);

type Props = {
  version: 1 | 2;
  sessionStore: SessionStore;
  startParams: StartParams;
  initialSessionState?: Pick<SessionState, "whatsApp" | "expiryTimeout">;
};

export const startSession = async ({
  version,
  sessionStore,
  startParams,
  initialSessionState,
}: Props): Promise<
  Omit<StartChatResponse, "resultId" | "isStreamEnabled" | "sessionId"> & {
    newSessionState: SessionState;
    visitedEdges: Prisma.VisitedEdge[];
    setVariableHistory: SetVariableHistoryItem[];
    resultId?: string;
  }
> => {
  const typebot = await getTypebot(startParams);
  Sentry.setUser({ id: typebot.id });

  const result = await getOrInitResult({
    resultId: startParams.type === "live" ? startParams.resultId : undefined,
    isPreview: startParams.type === "preview",
    isRememberUserEnabled:
      typebot.settings.general?.rememberUser?.isEnabled ??
      (isDefined(typebot.settings.general?.isNewResultOnRefreshEnabled)
        ? !typebot.settings.general?.isNewResultOnRefreshEnabled
        : defaultSettings.general.rememberUser.isEnabled),
  });

  const startVariables = result
    ? injectVariableValues({
        variables: typebot.variables,
        variablesWithValue: result.variables,
      })
    : typebot.variables;

  const typebotInSession = convertStartTypebotToTypebotInSession(
    typebot,
    startVariables,
  );

  let initialState: SessionState = {
    version: "3",
    workspaceId: typebot.workspaceId,
    publicTypebotId: typebot.publicTypebotId,
    typebotsQueue: [
      {
        resultId: result?.id,
        typebot: typebotInSession,
        answers: result
          ? result.answers.map((answer) => {
              const block = typebot.groups
                .flatMap<Block>((group) => group.blocks)
                .find((block) => block.id === answer.blockId);
              if (!block || !isInputBlock(block))
                return {
                  key: "unknown",
                  value: answer.content,
                };
              const key =
                (block.options?.variableId
                  ? startVariables.find(
                      (variable) => variable.id === block.options?.variableId,
                    )?.name
                  : typebot.groups.find((group) =>
                      group.blocks.find(
                        (blockInGroup) => blockInGroup.id === block.id,
                      ),
                    )?.title) ?? "unknown";
              return {
                key,
                value: answer.content,
              };
            })
          : [],
      },
    ],
    dynamicTheme: parseDynamicThemeInState(typebot.theme),
    isStreamEnabled: startParams.isStreamEnabled,
    typingEmulation: typebot.settings.typingEmulation,
    allowedOrigins:
      startParams.type === "preview"
        ? undefined
        : typebot.settings.security?.allowedOrigins,
    progressMetadata: initialSessionState?.whatsApp
      ? undefined
      : typebot.theme.general?.progressBar?.isEnabled
        ? { totalAnswers: 0 }
        : undefined,
    setVariableIdsForHistory: extractVariableIdsUsedForTranscript(
      typebotInSession,
      { sessionStore },
    ),
    ...initialSessionState,
  };

  const setVariableHistory: SetVariableHistoryItem[] = [];

  if (startParams.prefilledVariables) {
    const startingPoint = getStartingPoint({
      typebot: typebotInSession,
      startFrom: "startFrom" in startParams ? startParams.startFrom : undefined,
    });

    const firstBlockId = startingPoint
      ? getStartingPointFirstBlockId(startingPoint, {
          typebot: typebotInSession,
        })
      : undefined;

    if (firstBlockId) {
      const { updatedState, newSetVariableHistory } = updateVariablesInSession({
        state: initialState,
        newVariables: transformPrefilledVariablesToVariables(
          startParams.prefilledVariables,
          {
            existingVariables: typebotInSession.variables,
          },
        ),
        currentBlockId: firstBlockId,
      });
      initialState = updatedState;
      setVariableHistory.push(...newSetVariableHistory);
    }
  }

  if (startParams.isOnlyRegistering) {
    return {
      newSessionState: initialState,
      typebot: {
        id: typebot.id,
        version: typebot.version,
        settings: deepParseVariables(typebot.settings, {
          variables: initialState.typebotsQueue[0]?.typebot.variables,
          sessionStore,
        }),
        theme: sanitizeAndParseTheme(typebot.theme, {
          variables: initialState.typebotsQueue[0]?.typebot.variables,
          sessionStore,
        }),
      },
      dynamicTheme: parseDynamicTheme({ state: initialState, sessionStore }),
      messages: [],
      visitedEdges: [],
      setVariableHistory,
    };
  }

  const {
    messages,
    input,
    clientSideActions: startFlowClientActions,
    newSessionState,
    logs,
    visitedEdges,
    setVariableHistory: newSetVariableHistory,
  } = await startBotFlow({
    version,
    sessionStore,
    message: startParams.message,
    state: initialState,
    startFrom: "startFrom" in startParams ? startParams.startFrom : undefined,
    textBubbleContentFormat: startParams.textBubbleContentFormat,
  });
  setVariableHistory.push(...newSetVariableHistory);

  const clientSideActions = startFlowClientActions ?? [];

  const startClientSideAction = parseStartClientSideAction(typebot);

  const startLogs = logs ?? [];

  if (isDefined(startClientSideAction)) {
    if (!result) {
      if ("startPropsToInject" in startClientSideAction) {
        const { customHeadCode, googleAnalyticsId, pixelIds, gtmId } =
          startClientSideAction.startPropsToInject;
        let toolsList = "";
        if (customHeadCode) toolsList += "Custom head code, ";
        if (googleAnalyticsId) toolsList += "Google Analytics, ";
        if (pixelIds) toolsList += "Pixel, ";
        if (gtmId) toolsList += "Google Tag Manager, ";
        toolsList = toolsList.slice(0, -2);
        startLogs.push({
          description: `${toolsList} ${
            toolsList.includes(",") ? "are not" : "is not"
          } enabled in Preview mode`,
          status: "info",
        });
      }
    } else {
      clientSideActions.unshift(startClientSideAction);
    }
  }

  const clientSideActionsNeedSessionId = clientSideActions?.some(
    (action) => action.expectsDedicatedReply,
  );

  if (!input && !clientSideActionsNeedSessionId)
    return {
      newSessionState,
      messages,
      clientSideActions:
        clientSideActions.length > 0 ? clientSideActions : undefined,
      typebot: {
        id: typebot.id,
        version: typebot.version,
        settings: deepParseVariables(typebot.settings, {
          variables: newSessionState.typebotsQueue[0].typebot.variables,
          sessionStore,
        }),
        theme: sanitizeAndParseTheme(typebot.theme, {
          variables: initialState.typebotsQueue[0].typebot.variables,
          sessionStore,
        }),
        publishedAt: typebot.updatedAt,
      },
      dynamicTheme: parseDynamicTheme({ state: newSessionState, sessionStore }),
      logs: startLogs.length > 0 ? startLogs : undefined,
      visitedEdges,
      setVariableHistory,
    };

  return {
    newSessionState,
    resultId: result?.id,
    typebot: {
      id: typebot.id,
      version: typebot.version,
      settings: deepParseVariables(typebot.settings, {
        variables: newSessionState.typebotsQueue[0].typebot.variables,
        sessionStore,
      }),
      theme: sanitizeAndParseTheme(typebot.theme, {
        variables: initialState.typebotsQueue[0]?.typebot.variables,
        sessionStore,
      }),
      publishedAt: typebot.updatedAt,
    },
    messages,
    input,
    clientSideActions:
      clientSideActions.length > 0 ? clientSideActions : undefined,
    dynamicTheme: parseDynamicTheme({ state: newSessionState, sessionStore }),
    logs: startLogs.length > 0 ? startLogs : undefined,
    visitedEdges,
    setVariableHistory,
  };
};

const getTypebot = async (startParams: StartParams) => {
  if (startParams.type === "preview" && startParams.typebot)
    return startParams.typebot;

  if (
    startParams.type === "preview" &&
    !startParams.userId &&
    !env.NEXT_PUBLIC_E2E_TEST
  )
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You need to be authenticated to perform this action",
    });

  const typebotQuery =
    startParams.type === "preview"
      ? await findTypebot({
          id: startParams.typebotId,
          userId: startParams.userId,
        })
      : await findPublicTypebot({ publicId: startParams.publicId });

  const parsedTypebot =
    typebotQuery && "typebot" in typebotQuery
      ? {
          publicTypebotId: typebotQuery.id,
          id: typebotQuery.typebotId,
          ...omit(typebotQuery.typebot, "workspace"),
          ...omit(typebotQuery, "typebot", "typebotId", "id"),
        }
      : typebotQuery;

  if (!parsedTypebot || parsedTypebot.isArchived)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Typebot not found",
    });

  const isQuarantinedOrSuspended =
    typebotQuery &&
    "typebot" in typebotQuery &&
    (typebotQuery.typebot.workspace.isQuarantined ||
      typebotQuery.typebot.workspace.isSuspended);

  if (isQuarantinedOrSuspended)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: defaultSystemMessages.botClosed,
    });

  if ("isClosed" in parsedTypebot && parsedTypebot.isClosed)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        settingsSchema.parse(parsedTypebot.settings).general?.systemMessages
          ?.botClosed ?? defaultSystemMessages.botClosed,
    });

  return startTypebotSchema.parse(parsedTypebot);
};

const getOrInitResult = async ({
  isPreview,
  resultId,
  isRememberUserEnabled,
}: {
  resultId: string | undefined;
  isPreview: boolean;
  isRememberUserEnabled: boolean;
}) => {
  if (isPreview) return;
  const existingResult =
    resultId && isRememberUserEnabled
      ? await findResult({ id: resultId })
      : undefined;

  return {
    id: existingResult?.id ?? createId(),
    variables: existingResult?.variables
      ? resultSchema.shape.variables.parse(existingResult.variables)
      : undefined,
    answers: existingResult?.answers ?? [],
  };
};

const parseDynamicThemeInState = (theme: Theme) => {
  const hostAvatarUrl =
    (theme.chat?.hostAvatar?.isEnabled ?? defaultHostAvatarIsEnabled)
      ? theme.chat?.hostAvatar?.url
      : undefined;
  const guestAvatarUrl =
    (theme.chat?.guestAvatar?.isEnabled ?? defaultGuestAvatarIsEnabled)
      ? theme.chat?.guestAvatar?.url
      : undefined;
  const backgroundUrl = theme.general?.background?.content;
  if (
    !hostAvatarUrl?.startsWith("{{") &&
    !guestAvatarUrl?.startsWith("{{") &&
    !backgroundUrl?.startsWith("{{")
  )
    return;
  return {
    hostAvatarUrl: hostAvatarUrl?.startsWith("{{") ? hostAvatarUrl : undefined,
    guestAvatarUrl: guestAvatarUrl?.startsWith("{{")
      ? guestAvatarUrl
      : undefined,
    backgroundUrl: backgroundUrl?.startsWith("{{") ? backgroundUrl : undefined,
  };
};

const parseStartClientSideAction = (
  typebot: StartTypebot,
): NonNullable<StartChatResponse["clientSideActions"]>[number] | undefined => {
  const blocks = typebot.groups.flatMap<Block>((group) => group.blocks);
  const pixelBlocks = (
    blocks.filter(
      (block) =>
        block.type === IntegrationBlockType.PIXEL &&
        isNotEmpty(block.options?.pixelId) &&
        block.options?.isInitSkip !== true,
    ) as PixelBlock[]
  ).map((pixelBlock) => pixelBlock.options?.pixelId as string);

  const startPropsToInject = {
    customHeadCode: isNotEmpty(typebot.settings.metadata?.customHeadCode)
      ? sanitizeAndParseHeadCode(
          typebot.settings.metadata?.customHeadCode as string,
        )
      : undefined,
    gtmId: typebot.settings.metadata?.googleTagManagerId,
    googleAnalyticsId: (
      blocks.find(
        (block) =>
          block.type === IntegrationBlockType.GOOGLE_ANALYTICS &&
          block.options?.trackingId,
      ) as GoogleAnalyticsBlock | undefined
    )?.options?.trackingId,
    pixelIds: pixelBlocks.length > 0 ? pixelBlocks : undefined,
  };

  if (
    !startPropsToInject.customHeadCode &&
    !startPropsToInject.gtmId &&
    !startPropsToInject.googleAnalyticsId &&
    !startPropsToInject.pixelIds
  )
    return;

  return { type: "startPropsToInject", startPropsToInject };
};

const sanitizeAndParseTheme = (
  theme: Theme,
  {
    variables,
    sessionStore,
  }: { variables: Variable[]; sessionStore: SessionStore },
): Theme => ({
  general: theme.general
    ? deepParseVariables(theme.general, { variables, sessionStore })
    : undefined,
  chat: theme.chat
    ? deepParseVariables(theme.chat, { variables, sessionStore })
    : undefined,
  customCss: theme.customCss
    ? removeLiteBadgeCss(
        parseVariables(theme.customCss, { variables, sessionStore }),
      )
    : undefined,
});

const sanitizeAndParseHeadCode = (code: string) => {
  code = removeLiteBadgeCss(code);
  return parse(code)
    .childNodes.filter((child) => child.nodeType !== NodeType.TEXT_NODE)
    .join("\n");
};

const removeLiteBadgeCss = (code: string) => {
  // Remove all comments
  code = code.replace(/\/\*[\s\S]*?\*\//gm, "");

  // Match any rule containing lite-badge, handling nested blocks
  let prevCode;
  do {
    prevCode = code;
    code = code.replace(
      /([^{}]*)lite-badge[^{]*{[^{}]*}|[^{}]*lite-badge[^{]*{([^{}]*{[^{}]*})*[^{}]*}/gi,
      "",
    );
  } while (code !== prevCode);

  // Clean up any empty media queries or other nested rules
  return code.replace(/@[^{]+{[\s]*}/gm, "");
};

const convertStartTypebotToTypebotInSession = (
  typebot: StartTypebot,
  startVariables: Variable[],
): TypebotInSession => {
  const isAtLeastV6 = (typebot: StartTypebot): typebot is StartTypebotV6 =>
    Number(typebot.version) >= 6;
  if (isAtLeastV6(typebot)) {
    return {
      version: typebot.version,
      id: typebot.id,
      groups: typebot.groups,
      edges: typebot.edges,
      variables: startVariables,
      events: typebot.events,
      systemMessages: typebot.settings.general?.systemMessages,
    };
  }
  return {
    version: typebot.version,
    id: typebot.id,
    groups: typebot.groups,
    edges: typebot.edges,
    variables: startVariables,
    events: typebot.events,
    systemMessages: typebot.settings.general?.systemMessages,
  } as TypebotInSessionV5; // I am not sure why, this needs to be casted, the discrimination does not work here
};

const extractVariableIdsUsedForTranscript = (
  typebot: TypebotInSession,
  {
    sessionStore,
  }: {
    sessionStore: SessionStore;
  },
): string[] => {
  const variableIds: Set<string> = new Set();
  const parseVarParams = {
    variables: typebot.variables,
    takeLatestIfList: !isTypebotInSessionAtLeastV6(typebot),
  };
  typebot.groups.forEach((group) => {
    group.blocks.forEach((block) => {
      if (block.type === BubbleBlockType.TEXT) {
        const { parsedVariableIds } = parseVariablesInRichText(
          block.content?.richText ?? [],
          {
            ...parseVarParams,
            sessionStore,
          },
        );
        parsedVariableIds.forEach((variableId) => {
          variableIds.add(variableId);
        });
      }
      if (
        block.type === BubbleBlockType.IMAGE ||
        block.type === BubbleBlockType.VIDEO ||
        block.type === BubbleBlockType.AUDIO
      ) {
        if (!block.content?.url) return;
        const variablesInfo = getVariablesToParseInfoInText(block.content.url, {
          ...parseVarParams,
          sessionStore,
        });
        variablesInfo.forEach((variableInfo) => {
          variableInfo.variableId
            ? variableIds.add(variableInfo.variableId ?? "")
            : undefined;
        });
      }
      if (block.type === LogicBlockType.CONDITION) {
        block.items.forEach((item) => {
          item.content?.comparisons?.forEach((comparison) => {
            if (comparison.variableId) variableIds.add(comparison.variableId);
            if (comparison.value) {
              const variableIdsInValue = getVariablesToParseInfoInText(
                comparison.value,
                {
                  ...parseVarParams,
                  sessionStore,
                },
              );
              variableIdsInValue.forEach((variableInfo) => {
                variableInfo.variableId
                  ? variableIds.add(variableInfo.variableId)
                  : undefined;
              });
            }
          });
        });
      }
    });
  });
  return [...variableIds];
};

const getStartingPointFirstBlockId = (
  startingPoint: WalkFlowStartingPoint,
  {
    typebot,
  }: {
    typebot: TypebotInSession;
  },
): string | undefined => {
  if (startingPoint.type === "group") {
    return startingPoint.group.blocks.at(0)?.id;
  }
  const nextEdge = typebot.edges.find(byId(startingPoint.nextEdge?.id));
  if (!nextEdge) throw new Error("Next edge not found");
  if (nextEdge.to.blockId) return nextEdge.to.blockId;
  const nextGroup = typebot.groups.find(byId(nextEdge.to.groupId));
  if (!nextGroup) throw new Error("Next group not found");
  return nextGroup.blocks.at(0)?.id;
};
