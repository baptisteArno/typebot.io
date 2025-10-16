import { Textarea } from "@typebot.io/ui/components/Textarea";
import { cn } from "@typebot.io/ui/lib/cn";
import { useRef } from "react";
import { VariablesButton } from "@/features/variables/components/VariablesButton";
import { useDebounce } from "@/hooks/useDebounce";
import { useInjectableInputValue } from "@/hooks/useInjectableInputValue";

type Props = {
  id?: string;
  defaultValue?: string;
  className?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  debounceTimeout?: number;
};

export const DebouncedTextarea = ({
  id,
  defaultValue,
  className,
  onValueChange,
  placeholder,
  debounceTimeout = 1000,
}: Props) => {
  const commitValue = useDebounce((value: string) => {
    console.log("value", value);
    onValueChange?.(value);
  }, debounceTimeout);

  return (
    <Textarea
      id={id}
      defaultValue={defaultValue}
      onValueChange={(value) => {
        console.log("onValueChange", value);
        commitValue(value);
      }}
      placeholder={placeholder}
      className={className}
    />
  );
};

export const DebouncedTextareaWithVariablesButton = ({
  id,
  defaultValue,
  className,
  onValueChange,
  placeholder,
  debounceTimeout = 1000,
}: Props) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const { value, setValue, injectVariable } = useInjectableInputValue({
    ref,
    defaultValue,
  });

  const handleChange = (value: string) => {
    setValue(value);
    commitValue(value);
  };

  const commitValue = useDebounce((value: string) => {
    onValueChange?.(value);
  }, debounceTimeout);

  return (
    <div className="relative">
      <Textarea
        id={id}
        value={value}
        onValueChange={handleChange}
        ref={ref}
        placeholder={placeholder}
        className={cn(className, "pr-8")}
      />
      <VariablesButton
        variant="ghost"
        className="[&_svg]:opacity-60 size-7 absolute top-1 right-1"
        onSelectVariable={(variable) => {
          onValueChange?.(injectVariable(variable));
        }}
      />
    </div>
  );
};
