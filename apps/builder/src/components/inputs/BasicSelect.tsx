import { useFilteredCollection } from "@/features/forge/hooks/useFilteredCollection";
import { useParentModal } from "@/features/graph/providers/ParentModalProvider";
import { VariablesButton } from "@/features/variables/components/VariablesButton";
import { useDebounce } from "@/hooks/useDebounce";
import { useInjectableInputValue } from "@/hooks/useInjectableInputValue";
import { Portal } from "@ark-ui/react";
import {
  selectContentClassNames,
  selectItemClassNames,
} from "@typebot.io/ui/components/Select";
import { cx } from "@typebot.io/ui/lib/cva";
import { type ReactNode, useEffect, useRef } from "react";
import { MoreInfoTooltip } from "../MoreInfoTooltip";
import { type Item, getItemLabel, getItemValue } from "../collections";
import { Combobox } from "../combobox";
import { Field } from "../field";

type Props = {
  items: Item[] | undefined;
  defaultValue?: string;
  placeholder?: string;
  label?: string;
  helperText?: ReactNode;
  moreInfoTooltip?: string;
  isRequired?: boolean;
  onChange: (value: string | undefined) => void;
};

export const BasicSelect = ({
  items,
  defaultValue,
  placeholder,
  label,
  helperText,
  moreInfoTooltip,
  isRequired,
  onChange,
}: Omit<Props, "credentialsScope" | "fetcherId" | "options" | "blockDef"> & {
  items: Item[] | undefined;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    value: inputValue,
    setValue: setInputValue,
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
        className={cx("flex justify-between flex-col gap-2")}
        onInputValueChange={(details) => {
          setInputValue(details.inputValue);
          transformToValueAndPropagate(details.inputValue);
        }}
        onSelect={(details) => {
          onChange(getItemValue(details.itemValue));
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
          <VariablesButton
            onSelectVariable={(variable) => {
              setInputValue(`{{${variable.name}}}`);
              onChange(`{{${variable.name}}}`);
            }}
          />
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
