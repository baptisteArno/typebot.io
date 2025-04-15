import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { InputBlock } from "@typebot.io/blocks-inputs/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { deepParseVariables } from "@typebot.io/variables/deepParseVariables";
import { injectVariableValuesInCardsBlock } from "./blocks/cards/injectVariableValuesInCardsBlock";
import { injectVariableValuesInButtonsInputBlock } from "./blocks/inputs/buttons/injectVariableValuesInButtonsInputBlock";
import { parseDateInput } from "./blocks/inputs/date/parseDateInput";
import { computePaymentInputRuntimeOptions } from "./blocks/inputs/payment/computePaymentInputRuntimeOptions";
import { injectVariableValuesInPictureChoiceBlock } from "./blocks/inputs/pictureChoice/injectVariableValuesInPictureChoiceBlock";
import { getPrefilledInputValue } from "./getPrefilledValue";
import type { ContinueChatResponse, RuntimeOptions } from "./schemas/api";

export const formatInputForChatResponse = async (
  block: InputBlock,
  { state, sessionStore }: { state: SessionState; sessionStore: SessionStore },
): Promise<ContinueChatResponse["input"]> => {
  switch (block.type) {
    case InputBlockType.CHOICE: {
      return injectVariableValuesInButtonsInputBlock(block, {
        state,
        sessionStore,
      });
    }
    case InputBlockType.PICTURE_CHOICE: {
      return injectVariableValuesInPictureChoiceBlock(block, {
        variables: state.typebotsQueue[0].typebot.variables,
        sessionStore,
      });
    }
    case InputBlockType.NUMBER: {
      return deepParseVariables(
        {
          ...block,
          prefilledValue: getPrefilledInputValue(
            state.typebotsQueue[0].typebot.variables,
          )(block),
        },
        {
          variables: state.typebotsQueue[0].typebot.variables,
          sessionStore,
        },
      );
    }
    case InputBlockType.DATE: {
      return parseDateInput(block, {
        variables: state.typebotsQueue[0].typebot.variables,
        sessionStore,
      });
    }
    case InputBlockType.RATING: {
      return deepParseVariables(
        {
          ...block,
          prefilledValue: getPrefilledInputValue(
            state.typebotsQueue[0].typebot.variables,
          )(block),
        },
        {
          variables: state.typebotsQueue[0].typebot.variables,
          sessionStore,
        },
      );
    }
    case InputBlockType.CARDS: {
      return injectVariableValuesInCardsBlock(block, {
        variables: state.typebotsQueue[0].typebot.variables,
        sessionStore,
      });
    }
    default: {
      return deepParseVariables(
        {
          ...block,
          runtimeOptions: await computeRuntimeOptions(block, {
            sessionStore,
            state,
          }),
          prefilledValue: getPrefilledInputValue(
            state.typebotsQueue[0].typebot.variables,
          )(block),
        },
        {
          variables: state.typebotsQueue[0].typebot.variables,
          sessionStore,
        },
      );
    }
  }
};

const computeRuntimeOptions = (
  block: InputBlock,
  { sessionStore, state }: { sessionStore: SessionStore; state: SessionState },
): Promise<RuntimeOptions> | undefined => {
  switch (block.type) {
    case InputBlockType.PAYMENT: {
      return computePaymentInputRuntimeOptions(block.options, {
        sessionStore,
        state,
      });
    }
  }
};
