import { SendButton } from "@/components/SendButton";
import { ShortTextInput } from "@/components/inputs/ShortTextInput";
import type { InputSubmitContent } from "@/types";
import type { UrlInputBlock } from "@typebot.io/blocks-inputs/url/schema";
import type React from "react";
import { type MutableRefObject, useRef, useState } from "react";

type UrlInputProps = {
  block: UrlInputBlock;
  onSubmit: (value: InputSubmitContent) => void;
  defaultValue?: string;
  hasGuestAvatar: boolean;
};

export const UrlInput = ({
  block,
  onSubmit,
  defaultValue,
  hasGuestAvatar,
}: UrlInputProps) => {
  const [inputValue, setInputValue] = useState(defaultValue ?? "");
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const handleChange = (inputValue: string) => {
    if (!inputValue.startsWith("https://"))
      return inputValue === "https:/"
        ? undefined
        : setInputValue(`https://${inputValue}`);
    setInputValue(inputValue);
  };

  const checkIfInputIsValid = () =>
    inputValue !== "" && inputRef.current?.reportValidity();

  const submit = () => {
    if (checkIfInputIsValid()) onSubmit({ value: inputValue });
  };

  const submitWhenEnter = (e: React.KeyboardEvent) => {
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
        maxWidth: "350px",
      }}
      onKeyDown={submitWhenEnter}
    >
      <ShortTextInput
        ref={inputRef as MutableRefObject<HTMLInputElement>}
        value={inputValue}
        placeholder={block.options?.labels?.placeholder ?? "Type your URL..."}
        onChange={handleChange}
        type="url"
        autoComplete="url"
      />
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
