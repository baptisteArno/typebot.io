import type { BubbleProps } from "@typebot.io/js";
import { useState } from "react";
import { TextLink } from "@/components/TextLink";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { BubbleSettings } from "../../../settings/BubbleSettings/BubbleSettings";
import { getInitialBubbleTheme } from "../../javascript/instructions/JavascriptBubbleInstructions";
import { JavascriptBubbleSnippet } from "../../javascript/JavascriptBubbleSnippet";

export const FramerBubbleInstructions = () => {
  const { typebot } = useTypebot();

  const [theme, setTheme] = useState<BubbleProps["theme"]>(
    getInitialBubbleTheme(typebot),
  );
  const [previewMessage, setPreviewMessage] =
    useState<BubbleProps["previewMessage"]>();

  return (
    <>
      <ol className="flex flex-col gap-4 pl-5">
        <li>
          Head over to the <code>Site Settings</code> {">"} <code>General</code>{" "}
          {">"} <code>Custom Code</code> section
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
              Paste this in the{" "}
              <code>
                End of {"<"}body{">"} tag
              </code>{" "}
              input:
            </p>
            <JavascriptBubbleSnippet
              theme={theme}
              previewMessage={previewMessage}
            />
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
