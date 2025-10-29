import type { BubbleProps } from "@typebot.io/js";
import { useState } from "react";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { BubbleSettings } from "../../../settings/BubbleSettings/BubbleSettings";
import { getInitialBubbleTheme } from "../../javascript/instructions/JavascriptBubbleInstructions";
import { JavascriptBubbleSnippet } from "../../javascript/JavascriptBubbleSnippet";

export const ShopifyBubbleInstructions = () => {
  const { typebot } = useTypebot();

  const [theme, setTheme] = useState<BubbleProps["theme"]>(
    getInitialBubbleTheme(typebot),
  );
  const [previewMessage, setPreviewMessage] =
    useState<BubbleProps["previewMessage"]>();

  return (
    <ol>
      <li>
        On your shop dashboard in the <code>Themes</code> page, click on{" "}
        <code>Actions {">"} Edit code</code>
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
          <p>
            In <code>Layout {">"} theme.liquid</code> file, paste this code just
            before the closing <code>{"<head>"}</code> tag:
          </p>
          <JavascriptBubbleSnippet
            theme={theme}
            previewMessage={previewMessage}
          />
        </div>
      </li>
    </ol>
  );
};
