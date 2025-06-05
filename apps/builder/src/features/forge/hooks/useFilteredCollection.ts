import { type Item, getItemLabel } from "@/components/collections";
import { createListCollection } from "@ark-ui/react";
import { useMemo } from "react";

export const useFilteredCollection = <T extends Item>({
  items,
  filterQuery,
  isInputTouched,
}: {
  items: T[] | undefined;
  filterQuery: string;
  isInputTouched: boolean;
}) =>
  useMemo(() => {
    if (!items)
      return createListCollection({
        items: [] as Item[],
      });

    const formattedAndFilteredItems = isInputTouched
      ? items.reduce<Item[]>((acc, item) => {
          const label = getItemLabel(item);
          if (
            !filterQuery ||
            label.toLowerCase().includes(filterQuery.toLowerCase())
          )
            acc.push(item);

          return acc;
        }, [])
      : items;

    return createListCollection({
      items: formattedAndFilteredItems,
    });
  }, [items, filterQuery, isInputTouched]);
