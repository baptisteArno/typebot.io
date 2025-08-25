import { PlusIcon } from "@/components/icons";
import { Box, Fade, Flex, Stack } from "@chakra-ui/react";
import { createId } from "@paralleldrive/cuid2";
import { Button } from "@typebot.io/ui/components/Button";
import { TrashIcon } from "@typebot.io/ui/icons/TrashIcon";
import React, { useEffect, useState } from "react";

type ItemWithId<T extends number | string | boolean> = {
  id: string;
  value?: T;
};

export type TableListItemProps<T> = {
  item: T;
  onItemChange: (item: T) => void;
};

type Props<T extends number | string | boolean> = {
  initialItems?: T[];
  addLabel?: string;
  newItemDefaultProps?: Partial<T>;
  hasDefaultItem?: boolean;
  ComponentBetweenItems?: (props: unknown) => JSX.Element;
  onItemsChange: (items: T[]) => void;
  children: (props: TableListItemProps<T>) => JSX.Element;
};

const addIdToItems = <T extends number | string | boolean>(
  items: T[],
): ItemWithId<T>[] => items.map((item) => ({ id: createId(), value: item }));

const removeIdFromItems = <T extends number | string | boolean>(
  items: ItemWithId<T>[],
): T[] => items.map((item) => item.value as T);

export const PrimitiveList = <T extends number | string | boolean>({
  initialItems,
  addLabel = "Add",
  hasDefaultItem,
  children,
  ComponentBetweenItems,
  onItemsChange,
}: Props<T>) => {
  const [items, setItems] = useState<ItemWithId<T>[]>();
  const [showDeleteIndex, setShowDeleteIndex] = useState<number | null>(null);

  useEffect(() => {
    if (items) return;
    if (initialItems) {
      setItems(addIdToItems(initialItems));
    } else if (hasDefaultItem) {
      setItems(addIdToItems([]));
    } else {
      setItems([]);
    }
  }, [hasDefaultItem, initialItems, items]);

  const createItem = () => {
    if (!items) return;
    const newItems = [...items, { id: createId() }];
    setItems(newItems);
    onItemsChange(removeIdFromItems(newItems));
  };

  const updateItem = (itemIndex: number, newValue: T) => {
    if (!items) return;
    const newItems = items.map((item, idx) =>
      idx === itemIndex ? { ...item, value: newValue } : item,
    );
    setItems(newItems);
    onItemsChange(removeIdFromItems(newItems));
  };

  const deleteItem = (itemIndex: number) => () => {
    if (!items) return;
    const newItems = [...items];
    newItems.splice(itemIndex, 1);
    setItems([...newItems]);
    onItemsChange(removeIdFromItems([...newItems]));
  };

  const handleMouseEnter = (itemIndex: number) => () =>
    setShowDeleteIndex(itemIndex);

  const handleCellChange = (itemIndex: number) => (item: T) =>
    updateItem(itemIndex, item);

  const handleMouseLeave = () => setShowDeleteIndex(null);

  return (
    <Stack spacing={0}>
      {items?.map((item, itemIndex) => (
        <Box key={item.id}>
          {itemIndex !== 0 && ComponentBetweenItems && (
            <ComponentBetweenItems />
          )}
          <Flex
            pos="relative"
            onMouseEnter={handleMouseEnter(itemIndex)}
            onMouseLeave={handleMouseLeave}
            mt={itemIndex !== 0 && ComponentBetweenItems ? 4 : 0}
            justifyContent="center"
            pb="4"
          >
            {children({
              item: item.value as T,
              onItemChange: handleCellChange(itemIndex),
            })}
            <Fade
              in={showDeleteIndex === itemIndex}
              style={{
                position: "absolute",
                left: "-15px",
                top: "-15px",
                zIndex: 1,
              }}
              unmountOnExit
            >
              <Button
                variant="secondary"
                className="size-6"
                size="icon"
                aria-label="Remove item"
                onClick={deleteItem(itemIndex)}
              >
                <TrashIcon />
              </Button>
            </Fade>
          </Flex>
        </Box>
      ))}
      <Button onClick={createItem} className="flex-shrink-0">
        <PlusIcon />
        {addLabel}
      </Button>
    </Stack>
  );
};
