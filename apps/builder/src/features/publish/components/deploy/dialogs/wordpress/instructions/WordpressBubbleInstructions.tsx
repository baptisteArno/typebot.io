import type { BubbleProps } from "@typebot.io/js";
import { useState } from "react";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { TextLink } from "@/components/TextLink";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { isCloudProdInstance } from "@/helpers/isCloudProdInstance";
import packageJson from "../../../../../../../../../../packages/embeds/js/package.json";
import { BubbleSettings } from "../../../settings/BubbleSettings/BubbleSettings";
import { parseInitBubbleCode } from "../../../snippetParsers/bubble";
import { getInitialBubbleTheme } from "../../javascript/instructions/JavascriptBubbleInstructions";
import { typebotCloudLibraryVersion } from "./constants";

type Props = {
  publicId: string;
};
export const WordpressBubbleInstructions = ({ publicId }: Props) => {
  const { typebot } = useTypebot();

  const [theme, setTheme] = useState<BubbleProps["theme"]>(
    getInitialBubbleTheme(typebot),
  );
  const [previewMessage, setPreviewMessage] =
    useState<BubbleProps["previewMessage"]>();

  const initCode = parseInitBubbleCode({
    typebot: publicId,
    customDomain: typebot?.customDomain,
    theme,
    previewMessage,
  });

  return (
    <ol>
      <li>
        Install{" "}
        <TextLink href="https://wordpress.org/plugins/typebot/" isExternal>
          the official Typebot WordPress plugin
        </TextLink>
      </li>
      <li>
        Set <code>Library version</code> to{" "}
        <code>
          {isCloudProdInstance()
            ? typebotCloudLibraryVersion
            : packageJson.version}
        </code>
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
            You can now place the following code snippet in the Typebot panel in
            your WordPress admin:
          </p>
          <CodeEditor value={initCode} lang="javascript" isReadOnly />
        </div>
      </li>
    </ol>
  );
};
