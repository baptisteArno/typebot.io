import type { BubbleProps } from "@typebot.io/js";
import { useState } from "react";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { BubbleSettings } from "../../../settings/BubbleSettings/BubbleSettings";
import { getInitialBubbleTheme } from "../../javascript/instructions/JavascriptBubbleInstructions";
import { InstallReactPackageSnippet } from "../InstallReactPackageSnippet";
import { ReactBubbleSnippet } from "../ReactBubbleSnippet";

export const ReactBubbleInstructions = () => {
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
          <InstallReactPackageSnippet />
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
          <ReactBubbleSnippet theme={theme} previewMessage={previewMessage} />
        </div>
      </li>
    </ol>
  );
};
