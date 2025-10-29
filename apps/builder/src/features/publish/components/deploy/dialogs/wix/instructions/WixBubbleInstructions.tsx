import type { BubbleProps } from "@typebot.io/js";
import { useState } from "react";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { BubbleSettings } from "../../../settings/BubbleSettings/BubbleSettings";
import { getInitialBubbleTheme } from "../../javascript/instructions/JavascriptBubbleInstructions";
import { JavascriptBubbleSnippet } from "../../javascript/JavascriptBubbleSnippet";

export const WixBubbleInstructions = () => {
  const { typebot } = useTypebot();

  const [theme, setTheme] = useState<BubbleProps["theme"]>(
    getInitialBubbleTheme(typebot),
  );
  const [previewMessage, setPreviewMessage] =
    useState<BubbleProps["previewMessage"]>();

  return (
    <ol>
      <li>
        Go to <code>Settings</code> in your dashboard on Wix
      </li>
      <li>
        Click on <code>Custom Code</code> under <code>Advanced</code>
      </li>
      <li>
        Click <code>+ Add Custom Code</code> at the top right.
      </li>
      <li>
        <div className="flex flex-col gap-4">
          <BubbleSettings
            previewMessage={previewMessage}
            defaultPreviewMessageAvatar={
              typebot?.theme.chat?.hostAvatar?.url ?? ""
            }
            theme={theme}
            onPreviewMessageChange={setPreviewMessage}
            onThemeChange={setTheme}
          />
          <p> Paste this snippet in the code box:</p>
          <JavascriptBubbleSnippet
            theme={theme}
            previewMessage={previewMessage}
          />
        </div>
      </li>
      <li>
        Select &quot;Body - start&quot; under <code>Place Code in</code>
      </li>
      <li>Click Apply</li>
    </ol>
  );
};
