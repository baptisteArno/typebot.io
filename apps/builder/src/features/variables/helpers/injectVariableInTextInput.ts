import type { Variable } from "@typebot.io/variables/schemas";

type Props = {
  variable: Variable;
  text: string;
  at: number;
};

export const injectVariableInText = ({
  variable,
  text,
  at,
}: Props): { text: string; carretPosition: number } => {
  const textBeforeCursorPosition = text.substring(0, at);
  const textAfterCursorPosition = text.substring(at, text.length);
  const newText =
    textBeforeCursorPosition + `{{${variable.name}}}` + textAfterCursorPosition;
  const newCarretPosition = at + `{{${variable.name}}}`.length;
  return {
    text: newText,
    carretPosition: newCarretPosition,
  };
};
