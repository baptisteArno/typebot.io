import type { Variable } from "@typebot.io/variables/schemas";

type Props = {
  variable: Variable;
  text: string;
  start: number;
  end: number;
};

export const injectVariableInText = ({
  variable,
  text,
  start,
  end,
}: Props): { text: string; carretPosition: number } => {
  const textBeforeCursorPosition = text.substring(0, start);
  const textAfterCursorPosition = text.substring(end, text.length);
  const newText =
    textBeforeCursorPosition + `{{${variable.name}}}` + textAfterCursorPosition;
  const newCarretPosition = start + `{{${variable.name}}}`.length;
  return {
    text: newText,
    carretPosition: newCarretPosition,
  };
};
