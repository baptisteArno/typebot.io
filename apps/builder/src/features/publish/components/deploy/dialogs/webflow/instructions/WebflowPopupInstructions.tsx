import { useState } from "react";
import { TextLink } from "@/components/TextLink";
import { PopupSettings } from "../../../settings/PopupSettings";
import { JavascriptPopupSnippet } from "../../javascript/JavascriptPopupSnippet";

export const WebflowPopupInstructions = () => {
  const [inputValue, setInputValue] = useState<number>();

  return (
    <>
      <ol>
        <li>
          Press <code>A</code> to open the <code>Add elements</code> panel
        </li>
        <li>
          <div className="flex flex-col gap-4">
            <PopupSettings
              onUpdateSettings={(settings) =>
                setInputValue(settings.autoShowDelay)
              }
            />
            <p>
              Add an <code>Embed</code> element from the <code>components</code>{" "}
              section and paste this code:
            </p>
            <JavascriptPopupSnippet autoShowDelay={inputValue} />
          </div>
        </li>
      </ol>
      <p className="text-sm pl-5">
        Check out the{" "}
        <TextLink
          href="https://docs.typebot.io/deploy/web/webflow#popup"
          isExternal
        >
          Webflow embed documentation
        </TextLink>{" "}
        for more options.
      </p>
    </>
  );
};
