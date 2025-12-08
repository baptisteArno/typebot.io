import { createId } from "@paralleldrive/cuid2";
import { Button } from "@typebot.io/ui/components/Button";
import { PlusSignIcon } from "@typebot.io/ui/icons/PlusSignIcon";
import { TrashIcon } from "@typebot.io/ui/icons/TrashIcon";
import { cx } from "@typebot.io/ui/lib/cva";
import { type JSX, useEffect, useState } from "react";

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
    <div className="flex flex-col gap-0">
      {items?.map((item, itemIndex) => (
        <div key={item.id}>
          {itemIndex !== 0 && ComponentBetweenItems && (
            <ComponentBetweenItems />
          )}
          <div
            className={cx(
              "flex relative justify-center pb-4",
              itemIndex !== 0 && ComponentBetweenItems ? "mt-4" : "mt-0",
            )}
            onMouseEnter={handleMouseEnter(itemIndex)}
            onMouseLeave={handleMouseLeave}
          >
            {children({
              item: item.value as T,
              onItemChange: handleCellChange(itemIndex),
            })}
            {showDeleteIndex === itemIndex && (
              <Button
                variant="secondary"
                className="size-6 animate-in fade-in-0 absolute left-[-15px] top-[-15px] z-10"
                size="icon"
                aria-label="Remove item"
                onClick={deleteItem(itemIndex)}
              >
                <TrashIcon />
              </Button>
            )}
          </div>
        </div>
      ))}
      <Button onClick={createItem} className="shrink-0">
        <PlusSignIcon />
        {addLabel}
      </Button>
    </div>
  );
};
