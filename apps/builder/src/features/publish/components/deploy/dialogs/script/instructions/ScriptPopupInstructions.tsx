import { useState } from "react";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { PopupSettings } from "../../../settings/PopupSettings";
import { parseInitPopupCode } from "../../../snippetParsers/popup";
import {
  parseInlineScript,
  typebotImportCode,
} from "../../../snippetParsers/shared";

export const ScriptPopupInstructions = () => {
  const { typebot } = useTypebot();
  const [inputValue, setInputValue] = useState<number>();

  const scriptSnippet = parseInlineScript(
    `${typebotImportCode}

${parseInitPopupCode({
  typebot: typebot?.publicId ?? "",
  customDomain: typebot?.customDomain,
  autoShowDelay: inputValue,
})}`,
  );

  return (
    <div className="flex flex-col gap-4">
      <PopupSettings
        onUpdateSettings={(settings) => setInputValue(settings.autoShowDelay)}
      />
      <p>Run this script to initialize the typebot:</p>
      <CodeEditor isReadOnly value={scriptSnippet} lang="javascript" />
    </div>
  );
};
