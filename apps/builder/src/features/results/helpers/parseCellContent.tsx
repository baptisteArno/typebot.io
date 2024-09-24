import { Stack, Text } from "@chakra-ui/react";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { VariableWithValue } from "@typebot.io/variables/schemas";
import { FileLinks } from "../components/FileLinks";

export const parseCellContent = (
  content: VariableWithValue["value"],
  blockType?: InputBlockType,
): { element?: React.JSX.Element; plainText: string } => {
  if (!content) return { element: undefined, plainText: "" };
  if (Array.isArray(content))
    return {
      element: (
        <Stack spacing={2}>
          {content.map((item, idx) => (
            <Text key={idx}>
              {idx + 1}. {item}
            </Text>
          ))}
        </Stack>
      ),
      plainText: content.join(", "),
    };
  return blockType === InputBlockType.FILE
    ? { element: <FileLinks fileNamesStr={content} />, plainText: content }
    : { plainText: content.toString() };
};
