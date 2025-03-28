import { createId } from "@paralleldrive/cuid2";
import {
  defaultSetVariableOptions,
  sessionOnlySetVariableOptions,
} from "@typebot.io/blocks-logic/setVariable/constants";
import type { SetVariableBlock } from "@typebot.io/blocks-logic/setVariable/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { byId, isEmpty, isNotDefined } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import type { Answer } from "@typebot.io/results/schemas/answers";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { evaluateSetVariableExpression } from "@typebot.io/variables/evaluateSetVariableExpression";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type {
  SetVariableHistoryItem,
  VariableWithUnknowValue,
  VariableWithValue,
} from "@typebot.io/variables/schemas";
import { format as tzFormat, utcToZonedTime } from "date-fns-tz";
import {
  computeResultTranscript,
  parseTranscriptMessageText,
} from "../../../computeResultTranscript";
import type { ExecuteLogicResponse } from "../../../types";
import { updateVariablesInSession } from "../../../updateVariablesInSession";
import { parseScriptToExecuteClientSideAction } from "../script/executeScript";

export const executeSetVariable = async (
  block: SetVariableBlock,
  {
    state,
    sessionStore,
    setVariableHistory,
  }: {
    state: SessionState;
    sessionStore: SessionStore;
    setVariableHistory: SetVariableHistoryItem[];
  },
): Promise<ExecuteLogicResponse> => {
  const { variables } = state.typebotsQueue[0].typebot;
  if (!block.options?.variableId)
    return {
      outgoingEdgeId: block.outgoingEdgeId,
    };

  const expressionToEvaluate = await getExpressionToEvaluate(block.options, {
    state,
    sessionStore,
    blockId: block.id,
    setVariableHistory,
  });
  const isCode =
    (!block.options.type || block.options.type === "Custom") &&
    (block.options.isCode ?? defaultSetVariableOptions.isCode);
  if (
    expressionToEvaluate &&
    expressionToEvaluate.type === "code" &&
    !state.whatsApp &&
    (block.options.isExecutedOnClient ||
      block.options.type === "Moment of the day" ||
      block.options.type === "Device type")
  ) {
    const scriptToExecute = parseScriptToExecuteClientSideAction(
      variables,
      expressionToEvaluate.code,
      sessionStore,
    );
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      clientSideActions: [
        {
          type: "setVariable",
          setVariable: {
            scriptToExecute: {
              ...scriptToExecute,
              isCode,
            },
          },
          expectsDedicatedReply: true,
        },
      ],
    };
  }
  const { value, error } =
    (expressionToEvaluate
      ? await evaluateSetVariableExpression(expressionToEvaluate, {
          variables,
          sessionStore,
        })
      : undefined) ?? {};
  const existingVariable = variables.find(byId(block.options.variableId));
  if (!existingVariable) return { outgoingEdgeId: block.outgoingEdgeId };
  const newVariable = {
    ...existingVariable,
    value,
  };
  const saveInErrorVariable =
    (block.options.type === "Custom" || !block.options.type) &&
    block.options.isCode &&
    block.options.saveErrorInVariableId
      ? variables.find(byId(block.options.saveErrorInVariableId))
      : undefined;
  const { newSetVariableHistory, updatedState } = updateVariablesInSession({
    state,
    newVariables: [
      ...parseColateralVariableChangeIfAny({ state, options: block.options }),
      ...(saveInErrorVariable && error?.description
        ? [
            {
              ...saveInErrorVariable,
              value: error?.description,
            },
          ]
        : []),
      {
        ...newVariable,
        isSessionVariable: sessionOnlySetVariableOptions.includes(
          block.options.type as (typeof sessionOnlySetVariableOptions)[number],
        )
          ? true
          : newVariable.isSessionVariable,
      },
    ],
    currentBlockId: block.id,
  });

  return {
    outgoingEdgeId: block.outgoingEdgeId,
    newSessionState: updatedState,
    newSetVariableHistory,
    logs: error && isCode ? [error] : undefined,
  };
};

const getExpressionToEvaluate = async (
  options: SetVariableBlock["options"],
  {
    state,
    sessionStore,
    blockId,
    setVariableHistory,
  }: {
    state: SessionState;
    sessionStore: SessionStore;
    blockId: string;
    setVariableHistory: SetVariableHistoryItem[];
  },
): Promise<
  | { type: "code"; code: string }
  | { type: "value"; value: VariableWithValue["value"] }
  | null
> => {
  switch (options?.type) {
    case "Contact name":
      return state.whatsApp?.contact.name
        ? { type: "value", value: state.whatsApp.contact.name }
        : null;
    case "Phone number": {
      return state.whatsApp?.contact.phoneNumber
        ? { type: "value", value: state.whatsApp.contact.phoneNumber }
        : null;
    }
    case "Referral Click ID": {
      return state.whatsApp?.referral?.ctwaClickId
        ? { type: "value", value: state.whatsApp.referral.ctwaClickId }
        : null;
    }
    case "Referral Source ID": {
      return state.whatsApp?.referral?.sourceId
        ? { type: "value", value: state.whatsApp.referral.sourceId }
        : null;
    }
    case "Now": {
      const timeZone = parseVariables(options.timeZone, {
        variables: state.typebotsQueue[0].typebot.variables,
        sessionStore,
      });
      if (isEmpty(timeZone))
        return { type: "value", value: new Date().toISOString() };
      return { type: "value", value: toISOWithTz(new Date(), timeZone) };
    }

    case "Today":
      return { type: "value", value: new Date().toISOString() };
    case "Tomorrow": {
      const timeZone = parseVariables(options.timeZone, {
        variables: state.typebotsQueue[0].typebot.variables,
        sessionStore,
      });
      if (isEmpty(timeZone))
        return {
          type: "value",
          value: new Date(Date.now() + 86400000).toISOString(),
        };
      return {
        type: "value",
        value: toISOWithTz(new Date(Date.now() + 86400000), timeZone),
      };
    }
    case "Yesterday": {
      const timeZone = parseVariables(options.timeZone, {
        variables: state.typebotsQueue[0].typebot.variables,
        sessionStore,
      });
      if (isEmpty(timeZone))
        return {
          type: "value",
          value: new Date(Date.now() - 86400000).toISOString(),
        };
      return {
        type: "value",
        value: toISOWithTz(new Date(Date.now() - 86400000), timeZone),
      };
    }
    case "Random ID": {
      return { type: "value", value: createId() };
    }
    case "Result ID":
    case "User ID": {
      return {
        type: "value",
        value: state.typebotsQueue[0].resultId ?? createId(),
      };
    }
    case "Map item with same index": {
      const baseListVariableValue =
        state.typebotsQueue[0].typebot.variables.find(
          byId(options.mapListItemParams?.baseListVariableId),
        )?.value;
      const baseItemVariableValue =
        state.typebotsQueue[0].typebot.variables.find(
          byId(options.mapListItemParams?.baseItemVariableId),
        )?.value;
      const targetListVariableValue =
        state.typebotsQueue[0].typebot.variables.find(
          byId(options.mapListItemParams?.targetListVariableId),
        )?.value;

      if (
        !Array.isArray(baseListVariableValue) ||
        !baseItemVariableValue ||
        typeof baseItemVariableValue !== "string"
      )
        return null;
      const itemIndex = baseListVariableValue.indexOf(baseItemVariableValue);
      if (itemIndex === -1 || !Array.isArray(targetListVariableValue))
        return null;
      const value = targetListVariableValue.at(itemIndex);
      if (isEmpty(value)) return null;
      return {
        type: "value",
        value,
      };
    }
    case "Pop": {
      const variableValue = state.typebotsQueue[0].typebot.variables.find(
        byId(options.variableId),
      )?.value;
      if (isNotDefined(variableValue)) return null;
      if (!Array.isArray(variableValue))
        return {
          type: "value",
          value: [],
        };
      return {
        type: "value",
        value: variableValue.slice(0, -1),
      };
    }
    case "Shift": {
      const variableValue = state.typebotsQueue[0].typebot.variables.find(
        byId(options.variableId),
      )?.value;
      if (isNotDefined(variableValue)) return null;
      if (!Array.isArray(variableValue))
        return {
          type: "value",
          value: [],
        };
      return {
        type: "value",
        value: variableValue.slice(1),
      };
    }
    case "Append value(s)": {
      if (!options.variableId) return null;
      const item = parseVariables(options.item, {
        variables: state.typebotsQueue[0].typebot.variables,
        sessionStore,
      });
      const variableValue = state.typebotsQueue[0].typebot.variables.find(
        byId(options.variableId),
      )?.value;
      if (isNotDefined(variableValue))
        return {
          type: "value",
          value: [item],
        };
      if (!Array.isArray(variableValue))
        return { type: "value", value: [variableValue, item] };
      return { type: "value", value: variableValue.concat(item) };
    }
    case "Empty": {
      return null;
    }
    case "Moment of the day": {
      return {
        type: "code",
        code: `const now = new Date()
        if(now.getHours() < 12) return 'morning'
        if(now.getHours() >= 12 && now.getHours() < 18) return 'afternoon'
        if(now.getHours() >= 18) return 'evening'
        if(now.getHours() >= 22 || now.getHours() < 6) return 'night'`,
      };
    }
    case "Environment name": {
      return {
        type: "value",
        value: state.whatsApp ? "whatsapp" : "web",
      };
    }
    case "Device type": {
      return {
        type: "code",
        code: `const detectDeviceType = () => {
  const hasTouch = ('ontouchstart' in window) || 
                   (navigator.maxTouchPoints > 0) || 
                   (navigator.msMaxTouchPoints > 0);
  
  const isTabletByUA = /(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(
    navigator.userAgent
  );
  
  const isMobileByUA = /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(
    navigator.userAgent
  );
  
  const width = window.innerWidth;
  if (isTabletByUA || (hasTouch && width >= 768 && width <= 1024)) {
    return 'tablet';
  } else if (isMobileByUA || (hasTouch && width < 768)) {
    return 'mobile';
  } else {
    return 'desktop';
  }
};

return detectDeviceType()`,
      };
    }
    case "Transcript": {
      const props = await parseTranscriptProps(state);
      if (!props) return null;
      const typebotWithEmptyVariables = {
        ...state.typebotsQueue[0].typebot,
        variables: state.typebotsQueue[0].typebot.variables.map((v) => ({
          ...v,
          value: undefined,
        })),
      };
      const transcript = computeResultTranscript({
        typebot: typebotWithEmptyVariables,
        stopAtBlockId: blockId,
        ...props,
        setVariableHistory: props.setVariableHistory.concat(setVariableHistory),
        sessionStore,
      });
      return {
        type: "value",
        value: transcript
          .map(
            (message) =>
              `${
                message.role === "bot" ? "Assistant:" : "User:"
              } "${parseTranscriptMessageText(message)}"`,
          )
          .join("\n\n"),
      };
    }
    case "Custom":
    case undefined: {
      return options?.expressionToEvaluate
        ? { type: "code", code: options.expressionToEvaluate }
        : null;
    }
  }
};

const toISOWithTz = (date: Date, timeZone: string) => {
  const zonedDate = utcToZonedTime(date, timeZone);
  return tzFormat(zonedDate, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone });
};

type ParsedTranscriptProps = {
  answers: Pick<Answer, "blockId" | "content" | "attachedFileUrls">[];
  setVariableHistory: Pick<
    SetVariableHistoryItem,
    "blockId" | "variableId" | "value"
  >[];
  visitedEdges: string[];
};

const parseTranscriptProps = async (
  state: SessionState,
): Promise<ParsedTranscriptProps | undefined> => {
  if (!state.typebotsQueue[0].resultId)
    return parsePreviewTranscriptProps(state);
  return parseResultTranscriptProps(state);
};

const parsePreviewTranscriptProps = async (
  state: SessionState,
): Promise<ParsedTranscriptProps | undefined> => {
  if (!state.previewMetadata)
    return {
      answers: [],
      setVariableHistory: [],
      visitedEdges: [],
    };
  return {
    answers: state.previewMetadata.answers ?? [],
    setVariableHistory: state.previewMetadata.setVariableHistory ?? [],
    visitedEdges: state.previewMetadata.visitedEdges ?? [],
  };
};

type UnifiedAnswersFromDB = (ParsedTranscriptProps["answers"][number] & {
  createdAt: Date;
})[];

const parseResultTranscriptProps = async (
  state: SessionState,
): Promise<ParsedTranscriptProps | undefined> => {
  const result = await prisma.result.findUnique({
    where: {
      id: state.typebotsQueue[0].resultId,
    },
    select: {
      edges: {
        select: {
          edgeId: true,
          index: true,
        },
      },
      answers: {
        select: {
          blockId: true,
          content: true,
          createdAt: true,
        },
      },
      answersV2: {
        select: {
          blockId: true,
          content: true,
          createdAt: true,
          attachedFileUrls: true,
        },
      },
      setVariableHistory: {
        select: {
          blockId: true,
          variableId: true,
          index: true,
          value: true,
        },
      },
    },
  });
  if (!result) return;
  return {
    answers: (result.answersV2 as UnifiedAnswersFromDB)
      .concat(result.answers as UnifiedAnswersFromDB)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
    setVariableHistory: (
      result.setVariableHistory as SetVariableHistoryItem[]
    ).sort((a, b) => a.index - b.index),
    visitedEdges: result.edges
      .sort((a, b) => a.index - b.index)
      .map((edge) => edge.edgeId),
  };
};

const parseColateralVariableChangeIfAny = ({
  state,
  options,
}: {
  state: SessionState;
  options: SetVariableBlock["options"];
}): VariableWithUnknowValue[] => {
  if (!options || (options.type !== "Pop" && options.type !== "Shift"))
    return [];
  const listVariableValue = state.typebotsQueue[0].typebot.variables.find(
    (v) => v.id === options.variableId,
  )?.value;
  const variable = state.typebotsQueue[0].typebot.variables.find(
    (v) => v.id === options.saveItemInVariableId,
  );
  if (!variable || !listVariableValue) return [];
  const parsedListVariableValue = Array.isArray(listVariableValue)
    ? listVariableValue
    : [listVariableValue];
  return [
    {
      ...variable,
      value:
        options.type === "Pop"
          ? parsedListVariableValue.at(-1)
          : parsedListVariableValue.at(0),
    },
  ];
};
