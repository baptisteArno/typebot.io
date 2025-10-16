import { Autocomplete } from "@typebot.io/ui/components/Autocomplete";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { forwardRef, useRef, useState } from "react";
import { VariablesButton } from "@/features/variables/components/VariablesButton";
import { useDebounce } from "@/hooks/useDebounce";
import { useInjectableInputValue } from "@/hooks/useInjectableInputValue";

type Props = {
  items: string[];
  value?: string;
  placeholder?: string;
  defaultValue?: string;
  openOnFocus?: boolean;
  onChange: (value: string | undefined) => void;
  debounceTimeout?: number;
};

export const BasicAutocompleteInput = forwardRef<HTMLInputElement, Props>(
  (
    {
      items,
      value,
      placeholder,
      onChange,
      defaultValue,
      openOnFocus = true,
      debounceTimeout = 1000,
    },
    inputRef,
  ) => {
    const { onOpen, onClose, isOpen } = useOpenControls();
    const [inputValue, setInputValue] = useState(value ?? defaultValue);

    const _onChange = (value: string | undefined) => {
      setInputValue(value);
      commitValue(value);
    };

    const commitValue = useDebounce((value: string | undefined) => {
      onChange(value);
    }, debounceTimeout);

    return (
      <Autocomplete.Root
        value={value ?? inputValue}
        items={items}
        onValueChange={_onChange}
        defaultOpen={true}
        open={isOpen}
        onOpenChange={(open, details) => {
          if (details.reason === "input-clear") return;
          if (open) onOpen();
          else onClose();
        }}
      >
        <Autocomplete.Input
          ref={inputRef}
          placeholder={placeholder}
          onFocus={openOnFocus ? onOpen : undefined}
        />
        <Autocomplete.Popup>
          <Autocomplete.List>
            {(item: string) => (
              <Autocomplete.Item
                key={item}
                className="flex cursor-default py-2 pr-8 pl-4 text-base leading-4 outline-none select-none data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:text-gray-50 data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-2 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded data-[highlighted]:before:bg-gray-900"
                value={item}
              >
                {item}
              </Autocomplete.Item>
            )}
          </Autocomplete.List>
        </Autocomplete.Popup>
      </Autocomplete.Root>
    );
  },
);

export const BasicAutocompleteInputWithVariableButton = (props: Props) => {
  const ref = useRef<HTMLInputElement>(null);
  const { value, setValue, injectVariable } = useInjectableInputValue({
    ref,
    defaultValue: props.defaultValue,
  });

  const handleChange = (value: string | undefined) => {
    setValue(value ?? "");
    commitValue(value);
  };

  const commitValue = useDebounce((value: string | undefined) => {
    props.onChange?.(value);
  }, props.debounceTimeout ?? 1000);

  return (
    <div className="flex items-center gap-0">
      <BasicAutocompleteInput
        {...props}
        ref={ref}
        value={value}
        onChange={handleChange}
        debounceTimeout={0}
      />
      <VariablesButton
        onSelectVariable={(variable) => {
          props.onChange?.(injectVariable(variable));
        }}
      />
    </div>
  );
};
