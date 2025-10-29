import type { BubbleProps } from "@typebot.io/js";
import { useState } from "react";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { BubbleSettings } from "../../../settings/BubbleSettings/BubbleSettings";
import { getInitialBubbleTheme } from "../../javascript/instructions/JavascriptBubbleInstructions";
import { InstallNextjsPackageSnippet } from "../InstallNextjsPackageSnippet";
import { NextjsBubbleSnippet } from "../NextjsBubbleSnippet";

export const NextjsBubbleInstructions = () => {
  const { typebot } = useTypebot();
  const [theme, setTheme] = useState<BubbleProps["theme"]>(
    getInitialBubbleTheme(typebot),
  );
  const [previewMessage, setPreviewMessage] =
    useState<BubbleProps["previewMessage"]>();

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
          <BubbleSettings
            theme={theme}
            previewMessage={previewMessage}
            defaultPreviewMessageAvatar={
              typebot?.theme.chat?.hostAvatar?.url ?? ""
            }
            onThemeChange={setTheme}
            onPreviewMessageChange={setPreviewMessage}
          />
          <NextjsBubbleSnippet theme={theme} previewMessage={previewMessage} />
        </div>
      </li>
    </ol>
  );
};
