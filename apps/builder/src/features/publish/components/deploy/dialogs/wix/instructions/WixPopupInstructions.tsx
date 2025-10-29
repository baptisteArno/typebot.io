import { useState } from "react";
import { PopupSettings } from "../../../settings/PopupSettings";
import { JavascriptPopupSnippet } from "../../javascript/JavascriptPopupSnippet";

export const WixPopupInstructions = () => {
  const [inputValue, setInputValue] = useState<number>();

  return (
    <ol>
      <li>
        Go to <code>Settings</code> in your dashboard on Wix
      </li>
      <li>
        Click on <code>Custom Code</code> in the <code>Advanced</code> section
      </li>
      <li>
        Click <code>+ Add Custom Code</code> at the top right.
      </li>
      <li>
        <div className="flex flex-col gap-4">
          <PopupSettings
            onUpdateSettings={(settings) =>
              setInputValue(settings.autoShowDelay)
            }
          />
          <p>Paste this snippet in the code box:</p>
          <JavascriptPopupSnippet autoShowDelay={inputValue} />
        </div>
      </li>
      <li>
        Select &quot;Body - start&quot; under <code>Place Code in</code>
      </li>
      <li>Click Apply</li>
    </ol>
  );
};
