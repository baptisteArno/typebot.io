import type { NumberInputBlock } from "@typebot.io/blocks-inputs/number/schema";
import { isNotDefined } from "@typebot.io/lib/utils";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { Variable } from "@typebot.io/variables/schemas";

export const validateNumber = (
  inputValue: string,
  {
    options,
    variables,
  }: {
    options: NumberInputBlock["options"];
    variables: Variable[];
  },
) => {
  if (inputValue === "") return false;

  const parsedNumber = Number(
    inputValue.includes(",") ? inputValue.replace(",", ".") : inputValue,
  );
  if (isNaN(parsedNumber)) return false;

  const min =
    options?.min && typeof options.min === "string"
      ? Number(parseVariables(variables)(options.min))
      : undefined;
  const max =
    options?.min && typeof options.min === "string"
      ? Number(parseVariables(variables)(options.min))
      : undefined;
  return (
    (isNotDefined(min) || parsedNumber >= min) &&
    (isNotDefined(max) || parsedNumber <= max)
  );
};
