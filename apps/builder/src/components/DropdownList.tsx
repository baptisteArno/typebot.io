import { ChevronLeftIcon } from "@/components/icons";
import {
  Button,
  type ButtonProps,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Stack,
  chakra,
} from "@chakra-ui/react";
import type { ReactNode } from "react";
import React from "react";
import { MoreInfoTooltip } from "./MoreInfoTooltip";

type Item =
  | string
  | number
  | {
      label: string;
      value: string;
    };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props<T extends Item> = {
  currentItem: string | number | undefined;
  onItemSelect: (
    value: T extends string ? T : T extends number ? T : string,
    item?: T,
  ) => void;
  items: readonly T[];
  placeholder?: string;
  label?: string;
  isRequired?: boolean;
  direction?: "row" | "column";
  helperText?: ReactNode;
  moreInfoTooltip?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DropdownList = <T extends Item>({
  currentItem,
  onItemSelect,
  items,
  placeholder,
  label,
  isRequired,
  direction = "column",
  helperText,
  moreInfoTooltip,
  ...props
}: Props<T> & ButtonProps) => {
  const handleMenuItemClick = (item: T) => () => {
    if (typeof item === "string" || typeof item === "number")
      onItemSelect(
        item as T extends string ? T : T extends number ? T : string,
      );
    else
      onItemSelect(
        item.value as T extends string ? T : T extends number ? T : string,
        item,
      );
  };
  return (
    <FormControl
      isRequired={isRequired}
      as={direction === "column" ? Stack : HStack}
      justifyContent="space-between"
      width={props.width === "full" || label ? "full" : "auto"}
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
      <Menu isLazy>
        <MenuButton
          as={Button}
          rightIcon={<ChevronLeftIcon transform={"rotate(-90deg)"} />}
          colorScheme="gray"
          justifyContent="space-between"
          textAlign="left"
          w="full"
          {...props}
        >
          <chakra.span noOfLines={1} display="block">
            {currentItem
              ? getItemLabel(
                  items?.find((item) =>
                    typeof item === "string" || typeof item === "number"
                      ? currentItem === item
                      : currentItem === item.value,
                  ),
                )
              : (placeholder ?? "Select an item")}
          </chakra.span>
        </MenuButton>
        <Portal>
          <MenuList maxW="500px" zIndex={1500}>
            <Stack maxH={"35vh"} overflowY="auto" spacing="0">
              {items.map((item) => (
                <MenuItem
                  key={getItemValue(item)}
                  maxW="500px"
                  overflow="hidden"
                  whiteSpace="nowrap"
                  textOverflow="ellipsis"
                  onClick={handleMenuItemClick(item)}
                >
                  {typeof item === "object" ? item.label : item}
                </MenuItem>
              ))}
            </Stack>
          </MenuList>
        </Portal>
      </Menu>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

const getItemLabel = (item?: Item) => {
  if (!item) return "";
  if (typeof item === "object") return item.label;
  return item;
};

const getItemValue = (item: Item) => {
  if (typeof item === "object") return item.value;
  return item;
};
