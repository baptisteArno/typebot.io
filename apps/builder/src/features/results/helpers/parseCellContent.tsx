import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { VariableWithValue } from "@typebot.io/variables/schemas";
import type { JSX } from "react";
import { FileLinks } from "../components/FileLinks";

export const parseCellContent = (
  content: VariableWithValue["value"],
  blockType?: InputBlockType,
): { element?: JSX.Element; plainText: string } => {
  if (!content) return { element: undefined, plainText: "" };
  if (Array.isArray(content))
    return {
      element: (
        <div className="flex flex-col gap-2">
          {content.map((item, idx) => (
            <p key={idx}>
              {idx + 1}. {item}
            </p>
          ))}
        </div>
      ),
      plainText: content.join(", "),
    };
  return blockType === InputBlockType.FILE
    ? { element: <FileLinks fileNamesStr={content} />, plainText: content }
    : { plainText: content.toString() };
};
