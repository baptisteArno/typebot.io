import { createId } from "@paralleldrive/cuid2";
import { Button } from "@typebot.io/ui/components/Button";
import { PlusSignIcon } from "@typebot.io/ui/icons/PlusSignIcon";
import { TrashIcon } from "@typebot.io/ui/icons/TrashIcon";
import { cx } from "@typebot.io/ui/lib/cva";
import { type JSX, useEffect, useState } from "react";

const defaultItem = {
  id: createId(),
};

export type TableListItemProps<T> = {
  item: T;
  onItemChange: (item: T) => void;
};

type Props<T extends object> = {
  initialItems?: T[];
  isOrdered?: boolean;
  addLabel?: string;
  newItemDefaultProps?: Partial<T>;
  hasDefaultItem?: boolean;
  ComponentBetweenItems?: (props: unknown) => JSX.Element;
  onItemsChange: (items: T[]) => void;
  children: (props: TableListItemProps<T>) => JSX.Element;
};

export const TableList = <T extends object>({
  initialItems,
  isOrdered,
  addLabel = "Add",
  newItemDefaultProps,
  hasDefaultItem,
  children,
  ComponentBetweenItems,
  onItemsChange,
}: Props<T>) => {
  const [items, setItems] = useState(
    addIdsIfMissing(initialItems) ??
      (hasDefaultItem ? ([defaultItem] as T[]) : []),
  );
  const [showDeleteIndex, setShowDeleteIndex] = useState<number | null>(null);

  useEffect(() => {
    if (items.length && initialItems && initialItems?.length === 0)
      setItems(initialItems);
  }, [initialItems, items.length]);

  const createItem = () => {
    const id = createId();
    const newItem = { id, ...newItemDefaultProps } as T;
    setItems([...items, newItem]);
    onItemsChange([...items, newItem]);
  };

  const insertItem = (itemIndex: number) => () => {
    const id = createId();
    const newItem = { id } as T;
    const newItems = [...items];
    newItems.splice(itemIndex + 1, 0, newItem);
    setItems(newItems);
    onItemsChange(newItems);
  };

  const updateItem = (itemIndex: number, updates: Partial<T>) => {
    const newItems = items.map((item, idx) =>
      idx === itemIndex ? { ...item, ...updates } : item,
    );
    setItems(newItems);
    onItemsChange(newItems);
  };

  const deleteItem = (itemIndex: number) => () => {
    const newItems = [...items];
    newItems.splice(itemIndex, 1);
    setItems([...newItems]);
    onItemsChange([...newItems]);
  };

  const handleMouseEnter = (itemIndex: number) => () =>
    setShowDeleteIndex(itemIndex);

  const handleCellChange = (itemIndex: number) => (item: T) =>
    updateItem(itemIndex, item);

  const handleMouseLeave = () => setShowDeleteIndex(null);

  return (
    <div className="flex flex-col gap-0">
      {items.map((item, itemIndex) => (
        <div key={"id" in item ? (item.id as string) : itemIndex}>
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
            {children({ item, onItemChange: handleCellChange(itemIndex) })}
            {showDeleteIndex === itemIndex && (
              <Button
                size="icon"
                aria-label="Remove cell"
                onClick={deleteItem(itemIndex)}
                variant="secondary"
                className="shadow-md size-6 animate-in fade-in-0 absolute left-[-8px] top-[-8px]"
              >
                <TrashIcon />
              </Button>
            )}
            {true && itemIndex === 0 && showDeleteIndex === itemIndex && (
              <>
                <Button
                  size="icon"
                  aria-label={addLabel}
                  onClick={insertItem(itemIndex - 1)}
                  variant="secondary"
                  className="shadow-md size-6 animate-in fade-in-0 slide-in-from-bottom-1 absolute top-[-10px]"
                >
                  <PlusSignIcon />
                </Button>
                <Button
                  size="icon"
                  aria-label={addLabel}
                  onClick={insertItem(itemIndex)}
                  variant="secondary"
                  className="shadow-md size-6 animate-in fade-in-0 slide-in-from-top-1 absolute bottom-2"
                >
                  <PlusSignIcon />
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
      {(!isOrdered || items.length === 0) && (
        <Button onClick={createItem} className="shrink-0" variant="secondary">
          <PlusSignIcon />
          {addLabel}
        </Button>
      )}
    </div>
  );
};

const addIdsIfMissing = <T,>(items?: T[]): T[] | undefined =>
  items?.map((item) => ({
    id: createId(),
    ...item,
  }));
