import { injectVariableInText } from "@/features/variables/helpers/injectVariableInTextInput";
import { focusInput } from "@/helpers/focusInput";
import type { Variable } from "@typebot.io/variables/schemas";
import { useCallback, useEffect, useState } from "react";

export const useInjectableInputValue = ({
  ref,
  defaultValue,
}: {
  ref: React.RefObject<HTMLInputElement>;
  defaultValue?: string;
}) => {
  const [isTouched, setIsTouched] = useState(false);
  const [carretPosition, setCarretPosition] = useState<number>(
    defaultValue?.length ?? 0,
  );
  const [value, _setValue] = useState<string>(defaultValue ?? "");

  const onInputBlur = useCallback(() => {
    if (!ref.current) return;
    setCarretPosition(ref.current.selectionStart ?? 0);
  }, []);

  useEffect(() => {
    ref.current?.addEventListener("blur", onInputBlur);
    return () => {
      ref.current?.removeEventListener("blur", onInputBlur);
    };
  }, [onInputBlur]);

  const setValue = (text: string) => {
    if (!isTouched) setIsTouched(true);
    _setValue(text);
  };

  const injectVariable = (variable: Variable) => {
    if (!variable) return;
    if (!isTouched) {
      const newValue = `{{${variable.name}}}`;
      _setValue(newValue);
      return newValue;
    }
    const { text, carretPosition: newCarretPosition } = injectVariableInText({
      variable,
      text: value,
      at: carretPosition,
    });
    setValue(text);
    if (ref.current) focusInput({ at: newCarretPosition, input: ref.current });
    return text;
  };

  const replaceDefaultValue = (value: string) => {
    _setValue(value);
    if (!ref.current) return;
    setCarretPosition(ref.current.selectionStart ?? 0);
  };

  return { value, setValue, injectVariable, isTouched, replaceDefaultValue };
};
