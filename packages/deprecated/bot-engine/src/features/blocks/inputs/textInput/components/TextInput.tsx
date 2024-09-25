import { SendButton } from "@/components/SendButton";
import { ShortTextInput } from "@/components/inputs/ShortTextInput";
import { Textarea } from "@/components/inputs/Textarea";
import type { InputSubmitContent } from "@/types";
import type { TextInputBlock } from "@typebot.io/blocks-inputs/text/schema";
import type React from "react";
import { type MutableRefObject, useRef, useState } from "react";

type TextInputProps = {
  block: TextInputBlock;
  onSubmit: (value: InputSubmitContent) => void;
  defaultValue: string | undefined;
  hasGuestAvatar: boolean;
};

export const TextInput = ({
  block,
  onSubmit,
  defaultValue,
  hasGuestAvatar,
}: TextInputProps) => {
  const [inputValue, setInputValue] = useState(defaultValue ?? "");
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const isLongText = block.options?.isLong;

  const handleChange = (inputValue: string) => setInputValue(inputValue);

  const checkIfInputIsValid = () =>
    inputValue !== "" && inputRef.current?.reportValidity();

  const submit = () => {
    if (checkIfInputIsValid()) onSubmit({ value: inputValue });
  };

  const submitWhenEnter = (e: React.KeyboardEvent) => {
    if (isLongText) return;
    if (e.key === "Enter") submit();
  };

  return (
    <div
      className={
        "flex items-end justify-between rounded-lg pr-2 typebot-input w-full"
      }
      data-testid="input"
      style={{
        marginRight: hasGuestAvatar ? "50px" : "0.5rem",
        maxWidth: isLongText ? undefined : "350px",
      }}
      onKeyDown={submitWhenEnter}
    >
      {isLongText ? (
        <Textarea
          ref={inputRef as MutableRefObject<HTMLTextAreaElement>}
          onChange={handleChange}
          value={inputValue}
          placeholder={
            block.options?.labels?.placeholder ?? "Type your answer..."
          }
        />
      ) : (
        <ShortTextInput
          ref={inputRef as MutableRefObject<HTMLInputElement>}
          onChange={handleChange}
          value={inputValue}
          placeholder={
            block.options?.labels?.placeholder ?? "Type your answer..."
          }
        />
      )}
      <SendButton
        type="button"
        label={block.options?.labels?.button ?? "Send"}
        isDisabled={inputValue === ""}
        className="my-2 ml-2"
        onClick={submit}
      />
    </div>
  );
};
