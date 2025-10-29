import { useState } from "react";
import { PopupSettings } from "../../../settings/PopupSettings";
import { JavascriptPopupSnippet } from "../JavascriptPopupSnippet";

export const JavascriptPopupInstructions = () => {
  const [inputValue, setInputValue] = useState<number>();

  return (
    <div className="flex flex-col gap-4">
      <PopupSettings
        onUpdateSettings={(settings) => setInputValue(settings.autoShowDelay)}
      />
      <p>
        Paste this anywhere in the <code>{"<body>"}</code>:
      </p>
      <JavascriptPopupSnippet autoShowDelay={inputValue} />
    </div>
  );
};
