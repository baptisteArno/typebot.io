import { useState } from "react";
import { TextLink } from "@/components/TextLink";
import { PopupSettings } from "../../../settings/PopupSettings";
import { JavascriptPopupSnippet } from "../../javascript/JavascriptPopupSnippet";

export const FramerPopupInstructions = () => {
  const [inputValue, setInputValue] = useState<number>();

  return (
    <>
      <ol className="flex flex-col gap-4 pl-5">
        <li>
          Head over to the <code>Site Settings</code> {">"} <code>General</code>{" "}
          {">"} <code>Custom Code</code> section
        </li>
        <li>
          <div className="flex flex-col gap-4">
            <PopupSettings
              onUpdateSettings={(settings) =>
                setInputValue(settings.autoShowDelay)
              }
            />
            <p>
              Paste this in the{" "}
              <code>
                End of {"<"}body{">"} tag
              </code>{" "}
              input:
            </p>
            <JavascriptPopupSnippet autoShowDelay={inputValue} />
          </div>
        </li>
      </ol>
      <p className="text-sm pl-5">
        Check out the{" "}
        <TextLink
          href="https://www.framer.com/academy/lessons/custom-code"
          isExternal
        >
          Custom Code Framer doc
        </TextLink>{" "}
        for more information.
      </p>
    </>
  );
};
