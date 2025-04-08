import type { NumberInputBlock } from "@typebot.io/blocks-inputs/number/schema";
import { safeParseFloat } from "@typebot.io/lib/safeParseFloat";
import { isNotDefined } from "@typebot.io/lib/utils";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { Variable } from "@typebot.io/variables/schemas";
import type { ParsedReply } from "../../../types";

export const parseNumber = (
  inputValue: string,
  {
    options,
    variables,
    sessionStore,
  }: {
    options?: NumberInputBlock["options"];
    variables: Variable[];
    sessionStore: SessionStore;
  },
): ParsedReply => {
  if (inputValue === "") return { status: "fail" };

  const inputValueAsNumber = safeParseFloat(inputValue);
  if (isNotDefined(inputValueAsNumber)) return { status: "fail" };

  const min = safeParseFloat(
    parseVariables(options?.min?.toString(), { variables, sessionStore }),
  );
  const max = safeParseFloat(
    parseVariables(options?.max?.toString(), { variables, sessionStore }),
  );

  if (min && inputValueAsNumber < min) return { status: "fail" };
  if (max && inputValueAsNumber > max) return { status: "fail" };

  // Edge case, return the inputValue as is if starting with 0
  if (inputValue.startsWith("0"))
    return { status: "success", content: inputValue };

  return {
    status: "success",
    content: inputValueAsNumber.toString(),
  };
};
