import { useState } from "react";
import { PopupSettings } from "../../../settings/PopupSettings";
import { InstallNextjsPackageSnippet } from "../InstallNextjsPackageSnippet";
import { NextjsPopupSnippet } from "../NextjsPopupSnippet";

export const NextjsPopupInstructions = () => {
  const [inputValue, setInputValue] = useState<number>();

  return (
    <ol>
      <li>
        <div className="flex flex-col gap-4">
          <p>Install the packages</p>
          <InstallNextjsPackageSnippet />
        </div>
      </li>
      <li>
        <div className="flex flex-col gap-4">
          <PopupSettings
            onUpdateSettings={(settings) =>
              setInputValue(settings.autoShowDelay)
            }
          />
          <NextjsPopupSnippet autoShowDelay={inputValue} />
        </div>
      </li>
    </ol>
  );
};
