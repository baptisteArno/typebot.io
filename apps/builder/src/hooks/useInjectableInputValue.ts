import type { Variable } from "@typebot.io/variables/schemas";
import { type RefObject, useState } from "react";
import { injectVariableInText } from "@/features/variables/helpers/injectVariableInTextInput";
import { focusInput } from "@/helpers/focusInput";

export const useInjectableInputValue = ({
  ref,
  defaultValue,
}: {
  ref: RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  defaultValue?: string;
}) => {
  const [value, setValue] = useState<string>(defaultValue ?? "");

  const injectVariable = (variable: Variable) => {
    if (!variable || !ref.current) return value;
    const start = ref.current.selectionStart ?? ref.current.value.length ?? 0;
    const end = ref.current.selectionEnd ?? ref.current.value.length ?? 0;
    const { text, carretPosition: newCarretPosition } = injectVariableInText({
      variable,
      text: value,
      start,
      end,
    });
    setValue(text);
    if (ref.current) focusInput({ at: newCarretPosition, input: ref.current });
    return text;
  };

  return { value, setValue, injectVariable };
};
