import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { VariableWithValue } from "@typebot.io/variables/schemas";
import type { JSX } from "react";
import { FileLinks } from "../components/FileLinks";

export const parseCellContent = (
  content: VariableWithValue["value"],
  blockType?: InputBlockType,
): { element?: JSX.Element; plainText: string } => {
  if (!content) return { element: undefined, plainText: "" };
  if (Array.isArray(content)) {
    const itemKeyCounts = new Map<string, number>();
    return {
      element: (
        <div className="flex flex-col gap-2">
          {content.map((item, idx) => {
            const key = getRepeatedKey(String(item ?? ""), itemKeyCounts);
            return (
              <p key={key}>
                {idx + 1}. {item}
              </p>
            );
          })}
        </div>
      ),
      plainText: content.join(", "),
    };
  }
  return blockType === InputBlockType.FILE
    ? { element: <FileLinks fileNamesStr={content} />, plainText: content }
    : { plainText: content.toString() };
};

const getRepeatedKey = (value: string, counts: Map<string, number>) => {
  const count = counts.get(value) ?? 0;
  counts.set(value, count + 1);
  return count === 0 ? value : `${value}-${count}`;
};
