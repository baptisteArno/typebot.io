import { convertStrToList } from "@typebot.io/lib/convertStrToList";
import { isEmpty, isNotEmpty } from "@typebot.io/lib/utils";
import { Button } from "@typebot.io/ui/components/Button";
import { Input } from "@typebot.io/ui/components/Input";
import { Cancel01Icon } from "@typebot.io/ui/icons/Cancel01Icon";
import { cx } from "@typebot.io/ui/lib/cva";
import { useRef, useState } from "react";

type Props = {
  items?: string[];
  placeholder?: string;
  onValueChange: (value: string[]) => void;
};
export const TagsInput = ({ items, placeholder, onValueChange }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [focusedTagIndex, setFocusedTagIndex] = useState<number>();

  const handleInputChange = (value: string) => {
    setFocusedTagIndex(undefined);
    setInputValue(value);
    if (value.length - inputValue.length > 0) {
      const values = convertStrToList(value);
      if (values.length > 1) {
        onValueChange([...(items ?? []), ...values.filter(isNotEmpty)]);
        setInputValue("");
      }
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!items) return;

    if (e.key === "Backspace") {
      if (focusedTagIndex !== undefined) {
        if (focusedTagIndex === items.length - 1) {
          setFocusedTagIndex((idx) => idx! - 1);
        }
        removeItem(focusedTagIndex);
        return;
      }
      if (inputValue === "" && focusedTagIndex === undefined) {
        setFocusedTagIndex(items?.length - 1);
        return;
      }
    }

    if (e.key === "ArrowLeft") {
      if (focusedTagIndex !== undefined) {
        if (focusedTagIndex === 0) return;
        setFocusedTagIndex(focusedTagIndex - 1);
        return;
      }
      if (inputRef.current?.selectionStart === 0 && items) {
        setFocusedTagIndex(items.length - 1);
        return;
      }
    }
    if (e.key === "ArrowRight" && focusedTagIndex !== undefined) {
      if (focusedTagIndex === items.length - 1) {
        setFocusedTagIndex(undefined);
        return;
      }
      setFocusedTagIndex(focusedTagIndex + 1);
    }
  };

  const removeItem = (index: number) => {
    if (!items) return;
    const newItems = [...items];
    newItems.splice(index, 1);
    onValueChange(newItems);
  };

  const addItem = () => {
    if (isEmpty(inputValue)) return;
    setInputValue("");
    onValueChange(items ? [...items, inputValue.trim()] : [inputValue.trim()]);
  };

  return (
    <div
      className="flex flex-wrap gap-1 border py-1 px-2 rounded-md data-[focus=true]:outline-none data-[focus=true]:ring-orange-8 data-[focus=true]:ring-2 data-[focus=true]:border-transparent transition-[box-shadow,border-color]"
      onClick={() => inputRef.current?.focus()}
      onBlur={addItem}
      onKeyDown={handleKeyDown}
      data-focus={isFocused}
    >
      {items?.map((item, index) => (
        <Tag
          content={item}
          onDeleteClick={() => removeItem(index)}
          isFocused={focusedTagIndex === index}
        />
      ))}
      <Input
        ref={inputRef}
        size="sm"
        className="border-0 p-0 focus:ring-0 w-auto"
        value={inputValue}
        onValueChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter") addItem();
        }}
        placeholder={items && items.length === 0 ? placeholder : undefined}
      />
    </div>
  );
};

const Tag = ({
  isFocused,
  content,
  onDeleteClick,
}: {
  isFocused?: boolean;
  content: string;
  onDeleteClick: () => void;
}) => (
  <div
    className={cx(
      "flex items-center gap-0.5 border p-0.5 pl-2 rounded-sm max-w-full",
      isFocused ? "border-orange-9" : undefined,
    )}
  >
    <span className="text-sm line-clamp-1">{content}</span>
    <Button
      size="icon"
      aria-label="Remove tag"
      variant="ghost"
      className="size-6"
      onClick={onDeleteClick}
    >
      <Cancel01Icon />
    </Button>
  </div>
);
