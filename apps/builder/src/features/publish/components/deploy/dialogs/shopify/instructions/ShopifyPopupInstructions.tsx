import { useState } from "react";
import { PopupSettings } from "../../../settings/PopupSettings";
import { JavascriptPopupSnippet } from "../../javascript/JavascriptPopupSnippet";

export const ShopifyPopupInstructions = () => {
  const [inputValue, setInputValue] = useState<number>();

  return (
    <ol>
      <li>
        On your shop dashboard in the <code>Themes</code> page, click on{" "}
        <code>Actions {">"} Edit code</code>
      </li>
      <li>
        <div className="flex flex-col gap-4">
          <PopupSettings
            onUpdateSettings={(settings) =>
              setInputValue(settings.autoShowDelay)
            }
          />
          <p>
            In <code>Layout {">"} theme.liquid</code> file, paste this code just
            before the closing <code>{"<head>"}</code> tag:
          </p>
          <JavascriptPopupSnippet autoShowDelay={inputValue} />
        </div>
      </li>
    </ol>
  );
};
