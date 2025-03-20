export type Item = string | { label: string; value: string };

export const getItemLabel = (item: Item): string => {
  if (typeof item === "string") return item;
  return item.label;
};

export const getItemValue = (item: Item): string => {
  if (typeof item === "string") return item;
  return item.value;
};
