import {
  Select as ArkSelect,
  type ListCollection,
  Portal,
  type SelectRootProps,
} from "@ark-ui/react";
import { cx } from "class-variance-authority";
import { ChevronDownIcon } from "../icons/ChevronDownIcon";
import { cn } from "../lib/cn";
import { buttonVariants } from "./Button";

type Props<T> = {
  collection: ListCollection<T>;
  children: React.ReactNode;
  label?: string;
  placeholder?: string;
} & Pick<SelectRootProps<T>, "onValueChange">;

export const selectContentClassNames = cx(
  "bg-gray-1 dark:bg-gray-2 p-2 rounded-lg shadow-lg border overflow-auto max-h-[300px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[placement=bottom-start]:slide-in-from-top-2 data-[placement=top-start]:slide-in-from-bottom-2",
);

export const selectItemClassNames =
  "data-[highlighted]:bg-gray-2 dark:data-[highlighted]:bg-gray-3 p-2 rounded-md cursor-default";

export const Select = <T,>({
  collection,
  children,
  label,
  placeholder = "Select an item",
  onValueChange,
}: Props<T>) => {
  return (
    <ArkSelect.Root
      collection={collection}
      onValueChange={onValueChange}
      positioning={{
        gutter: 4,
      }}
    >
      <div className="flex gap-3 items-center">
        {label ? <ArkSelect.Label>{label}</ArkSelect.Label> : null}
        <ArkSelect.Control>
          <ArkSelect.Trigger
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            <ArkSelect.ValueText placeholder={placeholder} />
            <ArkSelect.Indicator>
              <ChevronDownIcon />
            </ArkSelect.Indicator>
          </ArkSelect.Trigger>
        </ArkSelect.Control>
      </div>
      <Portal>
        <ArkSelect.Positioner>
          <ArkSelect.Content className={selectContentClassNames}>
            {children}
          </ArkSelect.Content>
        </ArkSelect.Positioner>
      </Portal>
      <ArkSelect.HiddenSelect />
    </ArkSelect.Root>
  );
};

export const SelectItem = <T,>({
  item,
  children,
}: { item: T; children: React.ReactNode }) => (
  <ArkSelect.Item item={item} className={selectItemClassNames}>
    <ArkSelect.ItemText>{children}</ArkSelect.ItemText>
  </ArkSelect.Item>
);
