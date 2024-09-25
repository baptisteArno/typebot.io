import { parseVariables } from "@/features/variables";
import { useAnswers } from "@/providers/AnswersProvider";
import { useTypebot } from "@/providers/TypebotProvider";
import type { InputSubmitContent } from "@/types";
import type { ChoiceInputBlock } from "@typebot.io/blocks-inputs/choice/schema";
import type React from "react";
import { useState } from "react";
import { SendButton } from "../../../../../components/SendButton";

type ChoiceFormProps = {
  block: ChoiceInputBlock;
  onSubmit: (value: InputSubmitContent) => void;
};

export const ChoiceForm = ({ block, onSubmit }: ChoiceFormProps) => {
  const {
    typebot: { variables },
  } = useTypebot();
  const { resultValues } = useAnswers();
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const handleClick = (itemIndex: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (block.options?.isMultipleChoice) toggleSelectedItemIndex(itemIndex);
    else
      onSubmit({
        value: parseVariables(variables)(block.items[itemIndex].content),
        itemId: block.items[itemIndex].id,
      });
  };

  const toggleSelectedItemIndex = (itemIndex: number) => {
    const existingIndex = selectedIndices.indexOf(itemIndex);
    if (existingIndex !== -1) {
      selectedIndices.splice(existingIndex, 1);
      setSelectedIndices([...selectedIndices]);
    } else {
      setSelectedIndices([...selectedIndices, itemIndex]);
    }
  };

  const handleSubmit = () =>
    onSubmit({
      value: selectedIndices
        .map((itemIndex) =>
          parseVariables(variables)(block.items[itemIndex].content),
        )
        .join(", "),
    });

  const isUniqueFirstButton =
    resultValues &&
    resultValues.answers.length === 0 &&
    block.items.length === 1;

  return (
    <form className="flex flex-col items-end" onSubmit={handleSubmit}>
      <div className="flex flex-wrap justify-end">
        {block.items.map((item, idx) => (
          <span key={item.id} className="relative inline-flex ml-2 mb-2">
            <button
              role={block.options?.isMultipleChoice ? "checkbox" : "button"}
              onClick={handleClick(idx)}
              className={
                "py-2 px-4 text-left font-semibold rounded-md transition-all filter hover:brightness-90 active:brightness-75 duration-100 focus:outline-none typebot-button " +
                (selectedIndices.includes(idx) ||
                !block.options?.isMultipleChoice
                  ? ""
                  : "selectable")
              }
              data-testid="button"
              data-itemid={item.id}
            >
              {parseVariables(variables)(item.content)}
            </button>
            {isUniqueFirstButton && (
              <span className="flex h-3 w-3 absolute top-0 right-0 -mt-1 -mr-1 ping">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full brightness-225 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 brightness-200" />
              </span>
            )}
          </span>
        ))}
      </div>
      <div className="flex">
        {selectedIndices.length > 0 && (
          <SendButton
            label={block.options?.buttonLabel ?? "Send"}
            disableIcon
          />
        )}
      </div>
    </form>
  );
};
