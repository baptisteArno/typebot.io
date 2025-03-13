import type { DateInputBlock } from "@typebot.io/blocks-inputs/date/schema";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { deepParseVariables } from "@typebot.io/variables/deepParseVariables";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { Variable } from "@typebot.io/variables/schemas";
import { getPrefilledInputValue } from "../../../getPrefilledValue";

export const parseDateInput = (
  block: DateInputBlock,
  {
    sessionStore,
    variables,
  }: { sessionStore: SessionStore; variables: Variable[] },
) => {
  if (!block.options)
    return deepParseVariables(block, { variables, sessionStore });
  return {
    ...block,
    options: {
      ...deepParseVariables(block.options, { variables, sessionStore }),
      min: parseDateLimit(block.options.min, {
        hasTime: block.options.hasTime,
        variables,
        sessionStore,
      }),
      max: parseDateLimit(block.options.max, {
        hasTime: block.options.hasTime,
        variables,
        sessionStore,
      }),
    },
    prefilledValue: getPrefilledInputValue(variables)(block),
  };
};

const parseDateLimit = (
  limit:
    | NonNullable<DateInputBlock["options"]>["min"]
    | NonNullable<DateInputBlock["options"]>["max"],
  {
    hasTime,
    variables,
    sessionStore,
  }: {
    hasTime: NonNullable<DateInputBlock["options"]>["hasTime"];
    variables: Variable[];
    sessionStore: SessionStore;
  },
) => {
  if (!limit) return;
  const parsedLimit = parseVariables(limit, { variables, sessionStore });
  const dateIsoNoSecondsRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d/;
  const matchDateTime = parsedLimit.match(dateIsoNoSecondsRegex);
  if (matchDateTime)
    return hasTime ? matchDateTime[0] : matchDateTime[0].slice(0, 10);
  return parsedLimit;
};
