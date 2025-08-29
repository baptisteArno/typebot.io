import { VariablesButton } from "@/features/variables/components/VariablesButton";
import { injectVariableInText } from "@/features/variables/helpers/injectVariableInTextInput";
import { focusInput } from "@/helpers/focusInput";
import { useOpenControls } from "@/hooks/useOpenControls";
import {
  FormControl,
  HStack,
  Input,
  useColorModeValue,
} from "@chakra-ui/react";
import { env } from "@typebot.io/env";
import { isDefined } from "@typebot.io/lib/utils";
import { Button } from "@typebot.io/ui/components/Button";
import { Popover } from "@typebot.io/ui/components/Popover";
import { cn } from "@typebot.io/ui/lib/cn";
import type { Variable } from "@typebot.io/variables/schemas";
import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

type Props = {
  items: string[] | undefined;
  value?: string;
  defaultValue?: string;
  debounceTimeout?: number;
  placeholder?: string;
  withVariableButton?: boolean;
  moreInfoTooltip?: string;
  isRequired?: boolean;
  onChange: (value: string) => void;
};

export const AutocompleteInput = ({
  items,
  onChange: _onChange,
  debounceTimeout,
  placeholder,
  withVariableButton = true,
  value,
  defaultValue,
  isRequired,
}: Props) => {
  const bg = useColorModeValue("gray.200", "gray.700");
  const controls = useOpenControls();
  const [isTouched, setIsTouched] = useState(false);
  const [inputValue, setInputValue] = useState(defaultValue ?? "");
  const [carretPosition, setCarretPosition] = useState<number>(
    inputValue.length ?? 0,
  );

  const onChange = useDebouncedCallback(
    _onChange,
    env.NEXT_PUBLIC_E2E_TEST ? 0 : debounceTimeout,
  );

  useEffect(() => {
    if (isTouched || inputValue !== "" || !defaultValue || defaultValue === "")
      return;
    setInputValue(defaultValue ?? "");
  }, [defaultValue, inputValue, isTouched]);

  const [keyboardFocusIndex, setKeyboardFocusIndex] = useState<
    number | undefined
  >();
  const dropdownRef = useRef(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  const filteredItems = (
    inputValue === ""
      ? (items ?? [])
      : [
          ...(items ?? []).filter(
            (item) =>
              item.toLowerCase().startsWith((inputValue ?? "").toLowerCase()) &&
              item.toLowerCase() !== inputValue.toLowerCase(),
          ),
        ]
  ).slice(0, 50);

  useEffect(
    () => () => {
      onChange.flush();
    },
    [onChange],
  );

  const changeValue = (value: string) => {
    if (!isTouched) setIsTouched(true);
    if (!controls.isOpen) controls.onOpen();
    setInputValue(value);
    onChange(value);
  };

  const handleItemClick = (value: string) => () => {
    setInputValue(value);
    onChange(value);
    setKeyboardFocusIndex(undefined);
    inputRef.current?.focus();
  };

  const updateFocusedDropdownItem = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter" && isDefined(keyboardFocusIndex)) {
      handleItemClick(filteredItems[keyboardFocusIndex])();
      return setKeyboardFocusIndex(undefined);
    }
    if (e.key === "ArrowDown") {
      if (keyboardFocusIndex === undefined) return setKeyboardFocusIndex(0);
      if (keyboardFocusIndex === filteredItems.length - 1)
        return setKeyboardFocusIndex(0);
      itemsRef.current[keyboardFocusIndex + 1]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
      return setKeyboardFocusIndex(keyboardFocusIndex + 1);
    }
    if (e.key === "ArrowUp") {
      if (keyboardFocusIndex === 0 || keyboardFocusIndex === undefined)
        return setKeyboardFocusIndex(filteredItems.length - 1);
      itemsRef.current[keyboardFocusIndex - 1]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
      setKeyboardFocusIndex(keyboardFocusIndex - 1);
    }
  };

  const handleVariableSelected = (variable?: Variable) => {
    if (!variable) return;
    const { text, carretPosition: newCarretPosition } = injectVariableInText({
      variable,
      text: inputValue,
      at: carretPosition,
    });
    changeValue(text);
    focusInput({ at: newCarretPosition, input: inputRef.current });
  };

  const updateCarretPosition = (e: React.FocusEvent<HTMLInputElement>) => {
    const carretPosition = e.target.selectionStart;
    if (!carretPosition) return;
    setCarretPosition(carretPosition);
  };

  return (
    <FormControl isRequired={isRequired}>
      <HStack ref={dropdownRef} spacing={0} w="full">
        <Popover.Root isOpen={controls.isOpen} onClose={controls.onClose}>
          <Popover.Trigger>
            <Input
              autoComplete="off"
              ref={inputRef}
              value={value ?? inputValue}
              onChange={(e) => changeValue(e.target.value)}
              onFocus={controls.onOpen}
              onBlur={updateCarretPosition}
              onKeyDown={updateFocusedDropdownItem}
              placeholder={!items ? "Loading..." : placeholder}
              isDisabled={!items}
            />
          </Popover.Trigger>
          {filteredItems.length > 0 && (
            <Popover.Popup
              initialFocus={inputRef}
              className="max-h-[35vh] max-w-[35vw] overflow-y-auto gap-0 p-0"
              align="start"
              side="bottom"
              offset={1}
              matchWidth
            >
              {filteredItems.map((item, idx) => {
                return (
                  <Button
                    variant="ghost"
                    ref={(el) => {
                      itemsRef.current[idx] = el;
                    }}
                    className={cn(
                      "min-h-[40px] flex items-center font-normal text-md justify-start",
                      keyboardFocusIndex === idx
                        ? "bg-gray-3"
                        : "bg-transparent",
                    )}
                    key={idx}
                    onClick={handleItemClick(item)}
                    role="menuitem"
                  >
                    {item}
                  </Button>
                );
              })}
            </Popover.Popup>
          )}
        </Popover.Root>
        {withVariableButton && (
          <VariablesButton onSelectVariable={handleVariableSelected} />
        )}
      </HStack>
    </FormControl>
  );
};
