import { cn } from "@/lib/utils";
import {
  Select as ArkSelect,
  type ListCollection,
  Portal,
  type SelectRootProps,
} from "@ark-ui/react";
import { ChevronDownIcon } from "@typebot.io/ui/icons/ChevronDownIcon";
import { buttonVariants } from "./Button";

type Props<T> = {
  collection: ListCollection<T>;
  children: React.ReactNode;
  label?: string;
  placeholder?: string;
} & Pick<SelectRootProps<T>, "onValueChange">;

export const Select = <T,>({
  collection,
  children,
  label,
  placeholder = "Select an item",
  onValueChange,
}: Props<T>) => {
  return (
    <ArkSelect.Root collection={collection} onValueChange={onValueChange}>
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
          <ArkSelect.Content className="bg-gray-1 p-2 rounded-xl shadow-lg border max-h-[300px] overflow-auto data-[state=open]:motion-opacity-in-0 data-[state=open]:motion-translate-y-in-[-10px] motion-duration-150">
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
  <ArkSelect.Item
    item={item}
    className="data-[highlighted]:bg-gray-2 p-2 rounded-lg cursor-default"
  >
    <ArkSelect.ItemText>{children}</ArkSelect.ItemText>
  </ArkSelect.Item>
);
