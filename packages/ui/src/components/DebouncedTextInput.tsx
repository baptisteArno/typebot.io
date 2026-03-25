import { useDebounce } from "../hooks/useDebounce";
import type { ChangeEventDetails } from "./Field";
import { Input, type InputProps } from "./Input";

type Props = Omit<InputProps, "defaultValue"> & {
  defaultValue?: string;
  debounceTimeout?: number;
  ref?: React.Ref<HTMLInputElement>;
};

export const DebouncedTextInput = ({
  debounceTimeout = 1000,
  ref,
  ...props
}: Props) => {
  const commitValue = useDebounce(
    (value: string, eventDetails: ChangeEventDetails) => {
      props.onValueChange?.(value, eventDetails);
    },
    debounceTimeout,
  );

  return (
    <Input
      {...props}
      ref={ref}
      onValueChange={(value, eventDetails) => {
        commitValue(value, eventDetails);
      }}
    />
  );
};
