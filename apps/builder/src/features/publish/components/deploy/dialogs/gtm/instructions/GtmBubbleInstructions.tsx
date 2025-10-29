import type { BubbleProps } from "@typebot.io/js";
import { useState } from "react";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { BubbleSettings } from "../../../settings/BubbleSettings/BubbleSettings";
import { getInitialBubbleTheme } from "../../javascript/instructions/JavascriptBubbleInstructions";
import { JavascriptBubbleSnippet } from "../../javascript/JavascriptBubbleSnippet";

export const GtmBubbleInstructions = () => {
  const { typebot } = useTypebot();
  const [theme, setTheme] = useState<BubbleProps["theme"]>(
    getInitialBubbleTheme(typebot),
  );
  const [previewMessage, setPreviewMessage] =
    useState<BubbleProps["previewMessage"]>();

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
          <BubbleSettings
            theme={theme}
            previewMessage={previewMessage}
            defaultPreviewMessageAvatar={
              typebot?.theme.chat?.hostAvatar?.url ?? ""
            }
            onThemeChange={setTheme}
            onPreviewMessageChange={setPreviewMessage}
          />
          <p>Paste the code below:</p>
          <JavascriptBubbleSnippet
            theme={theme}
            previewMessage={previewMessage}
          />
        </div>
      </li>
    </ol>
  );
};
