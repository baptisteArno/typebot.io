import { useState } from "react";
import { PopupSettings } from "../../../settings/PopupSettings";
import { InstallReactPackageSnippet } from "../InstallReactPackageSnippet";
import { ReactPopupSnippet } from "../ReactPopupSnippet";

export const ReactPopupInstructions = () => {
  const [inputValue, setInputValue] = useState<number>();

  return (
    <ol>
      <li>
        <div className="flex flex-col gap-4">
          <p>Install the packages</p>
          <InstallReactPackageSnippet />
        </div>
      </li>
      <li>
        <div className="flex flex-col gap-4">
          <PopupSettings
            onUpdateSettings={(settings) =>
              setInputValue(settings.autoShowDelay)
            }
          />
          <ReactPopupSnippet autoShowDelay={inputValue} />
        </div>
      </li>
    </ol>
  );
};
