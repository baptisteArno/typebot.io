import { useParentModal } from "@/features/graph/providers/ParentModalProvider";
import { VariablesButton } from "@/features/variables/components/VariablesButton";
import { injectVariableInText } from "@/features/variables/helpers/injectVariableInTextInput";
import { focusInput } from "@/helpers/focusInput";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import {
  Button,
  FormControl,
  HStack,
  Input,
  Popover,
  PopoverAnchor,
  PopoverContent,
  Portal,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { env } from "@typebot.io/env";
import { isDefined } from "@typebot.io/lib/utils";
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
  const { onOpen, onClose, isOpen } = useDisclosure();
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
  const { ref: parentModalRef } = useParentModal();

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

  useOutsideClick({
    ref: dropdownRef,
    handler: onClose,
    isEnabled: isOpen,
  });

  useEffect(
    () => () => {
      onChange.flush();
    },
    [onChange],
  );

  const changeValue = (value: string) => {
    if (!isTouched) setIsTouched(true);
    if (!isOpen) onOpen();
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
        <Popover
          isOpen={isOpen}
          initialFocusRef={inputRef}
          offset={[0, 1]}
          isLazy
          placement="bottom-start"
        >
          <PopoverAnchor>
            <Input
              autoComplete="off"
              ref={inputRef}
              value={value ?? inputValue}
              onChange={(e) => changeValue(e.target.value)}
              onFocus={onOpen}
              onBlur={updateCarretPosition}
              onKeyDown={updateFocusedDropdownItem}
              placeholder={!items ? "Loading..." : placeholder}
              isDisabled={!items}
            />
          </PopoverAnchor>
          {filteredItems.length > 0 && (
            <Portal containerRef={parentModalRef}>
              <PopoverContent
                maxH="35vh"
                maxW="35vw"
                overflowY="auto"
                role="menu"
                w="inherit"
                shadow="lg"
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {filteredItems.map((item, idx) => {
                  return (
                    <Button
                      ref={(el) => (itemsRef.current[idx] = el)}
                      minH="40px"
                      key={idx}
                      onClick={handleItemClick(item)}
                      fontSize="16px"
                      fontWeight="normal"
                      rounded="none"
                      colorScheme="gray"
                      role="menuitem"
                      variant="ghost"
                      bg={keyboardFocusIndex === idx ? bg : "transparent"}
                      justifyContent="flex-start"
                      transition="none"
                    >
                      {item}
                    </Button>
                  );
                })}
              </PopoverContent>
            </Portal>
          )}
        </Popover>
        {withVariableButton && (
          <VariablesButton onSelectVariable={handleVariableSelected} />
        )}
      </HStack>
    </FormControl>
  );
};
