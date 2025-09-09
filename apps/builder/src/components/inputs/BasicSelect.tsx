import type { Select as PrimitiveSelect } from "@base-ui-components/react/select";
import { Tag } from "@chakra-ui/react";
import { Select, type TriggerProps } from "@typebot.io/ui/components/Select";
import type { Variable } from "@typebot.io/variables/schemas";
import { useMemo } from "react";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";

type NoInfer<T> = [T][T extends any ? 0 : never];

type Props<ItemValue, Value extends ItemValue | undefined = ItemValue> = Omit<
  PrimitiveSelect.Root.Props<ItemValue>,
  "items" | "onChange" | "onValueChange" | "value" | "defaultValue"
> & {
  // NoInfer prevents defaultValue being the source of a too-narrow ItemValue.
  defaultValue?: NoInfer<ItemValue>;
  value: Value;
  items:
    | Array<{
        label: React.ReactNode;
        value: ItemValue;
      }>
    | readonly ItemValue[];
  placeholder?: React.ReactNode;
  className?: string;
  size?: TriggerProps["size"];
  includeVariables?: boolean;
  onChange?: [undefined] extends [Value]
    ? (value: ItemValue | undefined) => void
    : (value: ItemValue) => void;
};

export const BasicSelect = <ItemValue, Value extends ItemValue | undefined>({
  items,
  onChange,
  placeholder,
  className,
  size,
  includeVariables,
  ...props
}: Props<ItemValue, Value>) => {
  const { typebot } = useTypebot();

  const enrichedItems = useEnrichedItems({
    items,
    placeholder,
    variables: includeVariables ? typebot?.variables : undefined,
  });

  const handleValueChange = (value: ItemValue) => {
    onChange?.(
      value === null || value === props.defaultValue
        ? (undefined as ItemValue)
        : value,
    );
  };

  return (
    <Select.Root
      {...props}
      // Base UI does not work well with undefined values so we need to convert it to null
      value={(props.value ?? props.defaultValue ?? null) as ItemValue}
      items={
        enrichedItems as Array<{
          label: React.ReactNode;
          value: ItemValue;
        }>
      }
      onValueChange={handleValueChange}
    >
      <Select.Trigger className={className} size={size} />
      <Select.Popup size={size}>
        {enrichedItems.map((item) => (
          <Select.Item
            key={(item.value as string) ?? "default"}
            value={item.value}
          >
            {item.label}
          </Select.Item>
        ))}
      </Select.Popup>
    </Select.Root>
  );
};

const useEnrichedItems = <ItemValue, Value extends ItemValue | undefined>({
  items,
  placeholder,
  variables,
  defaultValue,
}: {
  items: Props<ItemValue, Value>["items"];
  placeholder?: Props<ItemValue, Value>["placeholder"];
  variables?: Variable[];
  defaultValue?: Value;
}): Array<{
  label: React.ReactNode;
  value: ItemValue;
}> =>
  useMemo(() => {
    if (!items) return items;
    const enrichedItems =
      typeof items[0] === "string"
        ? items.map((item) => ({
            label: item as React.ReactNode,
            value: item as ItemValue,
          }))
        : [...(items as Array<{ label: React.ReactNode; value: ItemValue }>)];
    if (placeholder && !defaultValue)
      enrichedItems.unshift({
        label: placeholder,
        value: null as ItemValue,
      });
    if (variables)
      enrichedItems.push(
        ...variables.map((variable) => ({
          label: <Tag colorScheme="purple">{variable.name}</Tag>,
          isHidden: true,
          value: `{{${variable.name}}}` as ItemValue,
        })),
      );
    return enrichedItems;
  }, [items, placeholder, variables]);
