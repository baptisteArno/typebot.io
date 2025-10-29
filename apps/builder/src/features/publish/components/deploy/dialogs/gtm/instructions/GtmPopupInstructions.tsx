import { useState } from "react";
import { PopupSettings } from "../../../settings/PopupSettings";
import { JavascriptPopupSnippet } from "../../javascript/JavascriptPopupSnippet";

export const GtmPopupInstructions = () => {
  const [inputValue, setInputValue] = useState<number>();

  return (
    <ol>
      <li>
        On your GTM account dashboard, click on <code>Add a new tag</code>
      </li>
      <li>
        Choose <code>Custom HTML</code> tag type
      </li>
      <li>
        Check <code>Support document.write</code>
      </li>
      <li>
        <div className="flex flex-col gap-4">
          <PopupSettings
            onUpdateSettings={(settings) =>
              setInputValue(settings.autoShowDelay)
            }
          />
          <p>Paste the code below:</p>
          <JavascriptPopupSnippet autoShowDelay={inputValue} />
        </div>
      </li>
    </ol>
  );
};
