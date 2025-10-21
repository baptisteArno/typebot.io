import {
  Textarea,
  type TextareaProps,
} from "@typebot.io/ui/components/Textarea";
import { cn } from "@typebot.io/ui/lib/cn";
import { useRef } from "react";
import { VariablesButton } from "@/features/variables/components/VariablesButton";
import { useDebounce } from "@/hooks/useDebounce";
import { useInjectableInputValue } from "@/hooks/useInjectableInputValue";

type Props = Omit<TextareaProps, "defaultValue"> & {
  defaultValue?: string;
  debounceTimeout?: number;
};

export const DebouncedTextarea = ({
  debounceTimeout = 1000,
  ...props
}: Props) => {
  const commitValue = useDebounce((value: string) => {
    props.onValueChange?.(value);
  }, debounceTimeout);

  return <Textarea {...props} onValueChange={commitValue} />;
};

export const DebouncedTextareaWithVariablesButton = ({
  debounceTimeout = 1000,
  className,
  ...props
}: Props) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const { value, setValue, injectVariable } = useInjectableInputValue({
    ref,
    defaultValue: props.defaultValue,
  });

  const handleChange = (value: string) => {
    setValue(value);
    commitValue(value);
  };

  const commitValue = useDebounce((value: string) => {
    props.onValueChange?.(value);
  }, debounceTimeout);

  return (
    <div className="relative">
      <Textarea
        {...props}
        value={value}
        onValueChange={handleChange}
        ref={ref}
        className={cn(className, "pr-8")}
      />
      <VariablesButton
        variant="ghost"
        className="[&_svg]:opacity-60 size-7 absolute top-1 right-1"
        onSelectVariable={(variable) => {
          props.onValueChange?.(injectVariable(variable));
        }}
      />
    </div>
  );
};
