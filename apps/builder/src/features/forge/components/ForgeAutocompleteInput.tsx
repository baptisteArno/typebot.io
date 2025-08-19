import { MoreInfoTooltip } from "@/components/MoreInfoTooltip";
import { Portal } from "@/components/Portal";
import {
  type Item,
  getItemLabel,
  getItemValue,
} from "@/components/collections";
import { Combobox } from "@/components/combobox";
import { Field } from "@/components/field";
import { VariablesButton } from "@/features/variables/components/VariablesButton";
import { useDebounce } from "@/hooks/useDebounce";
import { useInjectableInputValue } from "@/hooks/useInjectableInputValue";
import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import type { ForgedBlock } from "@typebot.io/forge-repository/schemas";
import { cx } from "@typebot.io/ui/lib/cva";
import { type ReactNode, useEffect, useRef } from "react";
import { useFilteredCollection } from "../hooks/useFilteredCollection";
import { useSelectItemsQuery } from "../hooks/useSelectItemsQuery";

const selectContentClassNames = cx(
  "bg-gray-1 dark:bg-gray-2 p-2 rounded-lg shadow-lg border overflow-auto max-h-[300px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[placement=bottom-start]:slide-in-from-top-2 data-[placement=top-start]:slide-in-from-bottom-2",
);

const selectItemClassNames =
  "data-[highlighted]:bg-gray-2 dark:data-[highlighted]:bg-gray-3 p-2 rounded-md cursor-default";

type Props = {
  blockDef: ForgedBlockDefinition;
  defaultValue?: string;
  fetcherId: string;
  options: ForgedBlock["options"];
  placeholder?: string;
  label?: string;
  helperText?: ReactNode;
  moreInfoTooltip?: string;
  direction?: "row" | "column";
  isRequired?: boolean;
  width?: "full";
  withVariableButton?: boolean;
  credentialsScope: "workspace" | "user";
  onChange: (value: string | undefined) => void;
};

// TODO: Change to Base UI Combobox when available
export const ForgeAutocompleteInput = ({
  credentialsScope,
  fetcherId,
  options,
  blockDef,
  ...props
}: Props) => {
  const { items } = useSelectItemsQuery({
    credentialsScope,
    blockDef,
    options,
    fetcherId,
  });

  return <AutocompleteInput items={items} {...props} />;
};

export const AutocompleteInput = ({
  items,
  defaultValue,
  placeholder,
  label,
  helperText,
  moreInfoTooltip,
  isRequired,
  direction = "column",
  width,
  withVariableButton = false,
  onChange,
}: Omit<Props, "credentialsScope" | "fetcherId" | "options" | "blockDef"> & {
  items: Item[] | undefined;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    value: inputValue,
    setValue: setInputValue,
    injectVariable,
    replaceDefaultValue,
    isTouched,
  } = useInjectableInputValue({
    ref: inputRef,
  });

  const filteredCollection = useFilteredCollection({
    items,
    filterQuery: inputValue,
    isInputTouched: isTouched,
  });

  const transformToValueAndPropagate = useDebounce((label: string) => {
    const value = filteredCollection.items.find(
      (item) => getItemLabel(item) === label,
    );
    onChange(value ? getItemValue(value) : label);
  });

  useEffect(() => {
    if (!defaultValue || isTouched || !items || items?.length === 0) return;
    const defaultInputValue = items.find(
      (item) => getItemValue(item) === defaultValue,
    );
    replaceDefaultValue(
      defaultInputValue ? getItemLabel(defaultInputValue) : defaultValue,
    );
  }, [defaultValue, items?.length, isTouched]);

  return (
    <Field.Root required={isRequired} className="flex flex-col gap-1">
      <Combobox.Root
        placeholder={placeholder}
        collection={filteredCollection}
        className={cx(
          "flex justify-between",
          direction === "column" ? "flex-col gap-2" : "gap-3",
          label || width === "full" ? "w-full" : "w-auto",
        )}
        onInputValueChange={(details) => {
          setInputValue(details.inputValue);
          transformToValueAndPropagate(details.inputValue);
        }}
        inputValue={inputValue}
        allowCustomValue
      >
        {label && (
          <Combobox.Label>
            {label}{" "}
            {moreInfoTooltip && (
              <MoreInfoTooltip>{moreInfoTooltip}</MoreInfoTooltip>
            )}
          </Combobox.Label>
        )}
        <div className="flex items-center w-full">
          <Combobox.Control>
            <Combobox.Input />
          </Combobox.Control>
          {withVariableButton && (
            <VariablesButton
              onSelectVariable={(variable) => {
                const newValue = injectVariable(variable);
                onChange(newValue);
              }}
            />
          )}
        </div>

        <Portal>
          <Combobox.Positioner className="ark-positioner-z-10">
            {filteredCollection.size > 0 &&
              (filteredCollection.size > 1 ||
                getItemLabel(filteredCollection.items[0]) !== inputValue) && (
                <Combobox.Content className={selectContentClassNames}>
                  {filteredCollection.items.map((item) => (
                    <Combobox.Item
                      key={getItemValue(item)}
                      item={item}
                      className={selectItemClassNames}
                    >
                      {getItemLabel(item)}
                    </Combobox.Item>
                  ))}
                </Combobox.Content>
              )}
          </Combobox.Positioner>
        </Portal>
      </Combobox.Root>
      {helperText && <Field.HelperText>{helperText}</Field.HelperText>}
    </Field.Root>
  );
};
