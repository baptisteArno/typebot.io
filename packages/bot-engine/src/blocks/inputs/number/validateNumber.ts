import type { NumberInputBlock } from "@typebot.io/blocks-inputs/number/schema";
import { isNotDefined } from "@typebot.io/lib/utils";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { Variable } from "@typebot.io/variables/schemas";

export const validateNumber = (
  inputValue: string,
  {
    options,
    variables,
    sessionStore,
  }: {
    options: NumberInputBlock["options"];
    variables: Variable[];
    sessionStore: SessionStore;
  },
) => {
  if (inputValue === "") return false;

  const parsedNumber = Number(
    inputValue.includes(",") ? inputValue.replace(",", ".") : inputValue,
  );
  if (isNaN(parsedNumber)) return false;

  const min =
    options?.min && typeof options.min === "string"
      ? Number(parseVariables(options.min, { variables, sessionStore }))
      : undefined;
  const max =
    options?.max && typeof options.max === "string"
      ? Number(parseVariables(options.max, { variables, sessionStore }))
      : undefined;
  return (
    (isNotDefined(min) || parsedNumber >= min) &&
    (isNotDefined(max) || parsedNumber <= max)
  );
};
