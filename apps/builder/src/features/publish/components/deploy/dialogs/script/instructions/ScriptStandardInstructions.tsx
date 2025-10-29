import { useState } from "react";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { StandardSettings } from "../../../settings/StandardSettings";
import {
  parseInlineScript,
  typebotImportCode,
} from "../../../snippetParsers/shared";
import { parseInitStandardCode } from "../../../snippetParsers/standard";
import { parseStandardElementCode } from "../../javascript/JavascriptStandardSnippet";

export const ScriptStandardInstructions = () => {
  const { typebot } = useTypebot();
  const [inputValues, setInputValues] = useState<{
    heightLabel: string;
    widthLabel?: string;
  }>({
    heightLabel: "100%",
    widthLabel: "100%",
  });

  const standardElementSnippet = parseStandardElementCode(
    inputValues.widthLabel,
    inputValues.heightLabel,
  );

  const scriptSnippet = parseInlineScript(`${typebotImportCode}
  
${parseInitStandardCode({
  typebot: typebot?.publicId ?? "",
  customDomain: typebot?.customDomain,
})}`);

  return (
    <div className="flex flex-col gap-4">
      <StandardSettings
        onUpdateWindowSettings={(settings) => setInputValues({ ...settings })}
      />
      <p>
        Make sure you have this <code>typebot-standard</code> element in your{" "}
        <code>{"<body>"}</code>:
      </p>
      <CodeEditor isReadOnly value={standardElementSnippet} lang="html" />
      <p>Then, run this script to initialize the typebot:</p>
      <CodeEditor isReadOnly value={scriptSnippet} lang="javascript" />
    </div>
  );
};
