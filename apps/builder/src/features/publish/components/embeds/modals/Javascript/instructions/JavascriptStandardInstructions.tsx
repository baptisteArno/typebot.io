import { Code, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { StandardSettings } from "../../../settings/StandardSettings";
import { JavascriptStandardSnippet } from "../JavascriptStandardSnippet";

export const JavascriptStandardInstructions = () => {
  const [inputValues, setInputValues] = useState<{
    heightLabel: string;
    widthLabel?: string;
  }>({
    heightLabel: "100%",
    widthLabel: "100%",
  });

  return (
    <Stack spacing={4}>
      <StandardSettings
        onUpdateWindowSettings={(settings) => setInputValues({ ...settings })}
      />
      <Text>
        Paste this anywhere in the <Code>{"<body>"}</Code>:
      </Text>
      <JavascriptStandardSnippet {...inputValues} />
    </Stack>
  );
};
