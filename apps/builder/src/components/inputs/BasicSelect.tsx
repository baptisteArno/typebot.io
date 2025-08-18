import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import type { Select as PrimitiveSelect } from "@base-ui-components/react/select";
import { Tag } from "@chakra-ui/react";
import { Select, type TriggerProps } from "@typebot.io/ui/components/Select";
import type { Variable } from "@typebot.io/variables/schemas";
import { useMemo } from "react";

type Props<Value> = Omit<
  PrimitiveSelect.Root.Props<Value>,
  "items" | "onChange" | "onValueChange"
> & {
  items:
    | Array<{
        label: React.ReactNode;
        value: Value;
      }>
    | readonly Value[];
  placeholder?: React.ReactNode;
  className?: string;
  size?: TriggerProps["size"];
  includeVariables?: boolean;
  onChange?: (value: Value) => void;
};

export const BasicSelect = <Value,>({
  items,
  onChange,
  placeholder,
  className,
  size,
  includeVariables,
  ...props
}: Props<Value>) => {
  const { typebot } = useTypebot();

  const enrichedItems = useEnrichedItems({
    items,
    placeholder,
    variables: includeVariables ? typebot?.variables : undefined,
  });

  const handleValueChange = (value: Value) => {
    onChange?.(
      value === null || value === props.defaultValue
        ? (undefined as Value)
        : value,
    );
  };

  return (
    <Select.Root
      {...props}
      // Base UI does not work well with undefined values so we need to convert it to null
      value={props.value ?? props.defaultValue ?? null}
      items={
        enrichedItems as Array<{
          label: React.ReactNode;
          value: Value;
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

const useEnrichedItems = <Value,>({
  items,
  placeholder,
  variables,
  defaultValue,
}: {
  items: Props<Value>["items"];
  placeholder?: Props<Value>["placeholder"];
  variables?: Variable[];
  defaultValue?: Value;
}): Array<{
  label: React.ReactNode;
  value: Value;
}> =>
  useMemo(() => {
    if (!items) return items;
    const enrichedItems =
      typeof items[0] === "string"
        ? items.map((item) => ({
            label: item as React.ReactNode,
            value: item as Value,
          }))
        : [...(items as Array<{ label: React.ReactNode; value: Value }>)];
    if (placeholder && !defaultValue)
      enrichedItems.unshift({
        label: placeholder,
        value: null as Value,
      });
    if (variables)
      enrichedItems.push(
        ...variables.map((variable) => ({
          label: <Tag colorScheme="purple">{variable.name}</Tag>,
          isHidden: true,
          value: `{{${variable.name}}}` as Value,
        })),
      );
    return enrichedItems;
  }, [items, placeholder, variables]);
