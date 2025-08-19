import { EditIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useOpenControls } from "@/hooks/useOpenControls";
import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  IconButton,
  Input,
  type InputProps,
  Stack,
  Tag,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { createId } from "@paralleldrive/cuid2";
import { useTranslate } from "@tolgee/react";
import { byId, isDefined, isNotDefined } from "@typebot.io/lib/utils";
import { Popover } from "@typebot.io/ui/components/Popover";
import { cn } from "@typebot.io/ui/lib/cn";
import type { Variable } from "@typebot.io/variables/schemas";
import type { ChangeEvent, ReactNode } from "react";
import type React from "react";
import { useRef, useState } from "react";
import { MoreInfoTooltip } from "../MoreInfoTooltip";

type Props = {
  initialVariableId: string | undefined;
  autoFocus?: boolean;
  onSelectVariable: (
    variable: Pick<Variable, "id" | "name"> | undefined,
  ) => void;
  label?: string;
  placeholder?: string;
  helperText?: ReactNode;
  moreInfoTooltip?: string;
  direction?: "row" | "column";
  width?: "full";
} & Omit<InputProps, "placeholder">;

export const VariableSearchInput = ({
  initialVariableId,
  onSelectVariable,
  autoFocus,
  placeholder,
  label,
  helperText,
  moreInfoTooltip,
  direction = "column",
  isRequired,
  width,
  className,
  ...inputProps
}: Props) => {
  const focusedItemBgColor = useColorModeValue("gray.200", "gray.700");
  const { onOpen, onClose, isOpen } = useOpenControls({
    defaultIsOpen: autoFocus,
  });
  const { typebot, createVariable, deleteVariable, updateVariable } =
    useTypebot();
  const variables = typebot?.variables ?? [];
  const [inputValue, setInputValue] = useState(
    variables.find(byId(initialVariableId))?.name ?? "",
  );
  const [filteredItems, setFilteredItems] = useState<Variable[]>(
    variables ?? [],
  );
  const [keyboardFocusIndex, setKeyboardFocusIndex] = useState<
    number | undefined
  >();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const createVariableItemRef = useRef<HTMLButtonElement | null>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const { t } = useTranslate();

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value === "") {
      if (inputValue.length > 0) {
        onSelectVariable(undefined);
      }
      setFilteredItems([...variables.slice(0, 50)]);
      return;
    }
    setFilteredItems([
      ...variables
        .filter((item) =>
          item.name
            .toLowerCase()
            .includes((e.target.value ?? "").toLowerCase()),
        )
        .slice(0, 50),
    ]);
  };

  const handleVariableNameClick = (variable: Variable) => () => {
    setInputValue(variable.name);
    onSelectVariable(variable);
    setKeyboardFocusIndex(undefined);
    onClose();
  };

  const handleCreateNewVariableClick = () => {
    if (!inputValue || inputValue === "") return;
    const id = "v" + createId();
    onSelectVariable({ id, name: inputValue });
    createVariable({ id, name: inputValue, isSessionVariable: true });
    onClose();
  };

  const handleDeleteVariableClick =
    (variable: Variable) => (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteVariable(variable.id);
      setFilteredItems(filteredItems.filter((item) => item.id !== variable.id));
      if (variable.name === inputValue) {
        setInputValue("");
      }
    };

  const handleRenameVariableClick =
    (variable: Variable) => (e: React.MouseEvent) => {
      e.stopPropagation();
      const name = prompt(t("variables.rename"), variable.name);
      if (!name) return;
      updateVariable(variable.id, { name });
      setFilteredItems(
        filteredItems.map((item) =>
          item.id === variable.id ? { ...item, name } : item,
        ),
      );
    };

  const isCreateVariableButtonDisplayed =
    (inputValue?.length ?? 0) > 0 &&
    isNotDefined(variables.find((v) => v.name === inputValue));

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isDefined(keyboardFocusIndex)) {
      if (keyboardFocusIndex === 0 && isCreateVariableButtonDisplayed)
        handleCreateNewVariableClick();
      else
        handleVariableNameClick(
          filteredItems[
            keyboardFocusIndex - (isCreateVariableButtonDisplayed ? 1 : 0)
          ],
        )();
      return setKeyboardFocusIndex(undefined);
    }
    if (e.key === "ArrowDown") {
      if (keyboardFocusIndex === undefined) return setKeyboardFocusIndex(0);
      if (keyboardFocusIndex >= filteredItems.length) return;
      itemsRef.current[keyboardFocusIndex + 1]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
      return setKeyboardFocusIndex(keyboardFocusIndex + 1);
    }
    if (e.key === "ArrowUp") {
      if (keyboardFocusIndex === undefined) return;
      if (keyboardFocusIndex <= 0) return setKeyboardFocusIndex(undefined);
      itemsRef.current[keyboardFocusIndex - 1]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
      return setKeyboardFocusIndex(keyboardFocusIndex - 1);
    }
    return setKeyboardFocusIndex(undefined);
  };

  const openDropdown = () => {
    if (inputValue === "") setFilteredItems(variables);
    onOpen();
  };

  return (
    <FormControl
      isRequired={isRequired}
      as={direction === "column" ? Stack : HStack}
      justifyContent="space-between"
      width={label || width === "full" ? "full" : "auto"}
      spacing={direction === "column" ? 2 : 3}
    >
      {label && (
        <FormLabel display="flex" flexShrink={0} gap="1" mb="0" mr="0">
          {label}{" "}
          {moreInfoTooltip && (
            <MoreInfoTooltip>{moreInfoTooltip}</MoreInfoTooltip>
          )}
        </FormLabel>
      )}
      <Flex ref={dropdownRef} w="full">
        <Popover.Root
          isOpen={isOpen}
          onClose={() => {
            setInputValue(variables.find(byId(initialVariableId))?.name ?? "");
            onClose();
          }}
        >
          <Popover.Trigger className={cn(className, "flex-1")}>
            <Input
              data-testid="variables-input"
              ref={inputRef}
              value={inputValue}
              onChange={onInputChange}
              onFocus={openDropdown}
              onKeyDown={handleKeyUp}
              placeholder={placeholder ?? t("variables.select")}
              autoComplete="off"
              {...inputProps}
            />
          </Popover.Trigger>
          <Popover.Popup
            initialFocus={inputRef}
            className="p-0 max-h-[35vh] overflow-y-auto min-w-[var(--anchor-width)] max-w-[35vw] gap-0"
            offset={1}
            align="start"
          >
            {isCreateVariableButtonDisplayed && (
              <Button
                as="li"
                ref={createVariableItemRef}
                role="menuitem"
                minH="40px"
                onClick={handleCreateNewVariableClick}
                fontSize="16px"
                fontWeight="normal"
                rounded="none"
                colorScheme="gray"
                variant="ghost"
                justifyContent="flex-start"
                leftIcon={<PlusIcon />}
                bgColor={
                  keyboardFocusIndex === 0 ? focusedItemBgColor : "transparent"
                }
              >
                {t("create")}
                <Tag colorScheme="orange" ml="1">
                  <Text noOfLines={0} display="block">
                    {inputValue}
                  </Text>
                </Tag>
              </Button>
            )}
            {filteredItems.length > 0 &&
              filteredItems.map((item, idx) => {
                const indexInList = isCreateVariableButtonDisplayed
                  ? idx + 1
                  : idx;
                return (
                  <Button
                    as="li"
                    cursor="pointer"
                    ref={(el: HTMLButtonElement | null) => {
                      if (el) itemsRef.current[idx] = el;
                    }}
                    role="menuitem"
                    minH="40px"
                    key={idx}
                    onClick={handleVariableNameClick(item)}
                    fontSize="16px"
                    fontWeight="normal"
                    rounded="none"
                    colorScheme="gray"
                    variant="ghost"
                    justifyContent="space-between"
                    bgColor={
                      keyboardFocusIndex === indexInList
                        ? focusedItemBgColor
                        : "transparent"
                    }
                    transition="none"
                  >
                    <Text noOfLines={0} display="block" pr="2">
                      {item.name}
                    </Text>

                    <HStack>
                      <IconButton
                        icon={<EditIcon />}
                        aria-label={t("variables.rename")}
                        size="xs"
                        onClick={handleRenameVariableClick(item)}
                      />
                      <IconButton
                        icon={<TrashIcon />}
                        aria-label={t("variables.remove")}
                        size="xs"
                        onClick={handleDeleteVariableClick(item)}
                      />
                    </HStack>
                  </Button>
                );
              })}
          </Popover.Popup>
        </Popover.Root>
      </Flex>
      {helperText && <FormHelperText mt="0">{helperText}</FormHelperText>}
    </FormControl>
  );
};
