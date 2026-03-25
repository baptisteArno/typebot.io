import type { ChangeEventDetails } from "@typebot.io/ui/components/Field";
import { Input, type InputProps } from "@typebot.io/ui/components/Input";
import { cn } from "@typebot.io/ui/lib/cn";
import { useRef } from "react";
import { VariablesButton } from "@/features/variables/components/VariablesButton";
import { useDebounce } from "@/hooks/useDebounce";
import { useInjectableInputValue } from "@/hooks/useInjectableInputValue";

type Props = Omit<InputProps, "defaultValue"> & {
  defaultValue?: string;
  debounceTimeout?: number;
};

export const DebouncedTextInputWithVariablesButton = ({
  debounceTimeout = 1000,
  className,
  ...props
}: Omit<Props, "onValueChange"> & {
  onValueChange: (value: string, eventDetails?: ChangeEventDetails) => void;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const { value, setValue, injectVariable } = useInjectableInputValue({
    ref,
    defaultValue: props.defaultValue,
  });

  const handleChange = (value: string, eventDetails: ChangeEventDetails) => {
    setValue(value);
    commitValue(value, eventDetails);
  };

  const commitValue = useDebounce(
    (value: string, eventDetails: ChangeEventDetails) => {
      props.onValueChange?.(value, eventDetails);
    },
    debounceTimeout,
  );

  return (
    <div className="relative w-full">
      <Input
        {...props}
        value={value}
        onValueChange={handleChange}
        ref={ref}
        className={cn(className, "pr-8")}
        onBlur={() => {
          commitValue.flush();
        }}
      />
      <VariablesButton
        variant="ghost"
        className="[&_svg]:opacity-60 size-7 absolute top-1/2 -translate-y-1/2 right-1"
        onSelectVariable={(variable) => {
          props.onValueChange?.(injectVariable(variable));
        }}
      />
    </div>
  );
};
