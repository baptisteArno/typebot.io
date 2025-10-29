import { useState } from "react";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { TextLink } from "@/components/TextLink";
import { isCloudProdInstance } from "@/helpers/isCloudProdInstance";
import packageJson from "../../../../../../../../../../packages/embeds/js/package.json";
import { PopupSettings } from "../../../settings/PopupSettings";
import { parseInitPopupCode } from "../../../snippetParsers/popup";
import { typebotCloudLibraryVersion } from "./constants";

type Props = {
  publicId: string;
  customDomain?: string;
};
export const WordpressPopupInstructions = ({
  publicId,
  customDomain,
}: Props) => {
  const [autoShowDelay, setAutoShowDelay] = useState<number>();

  const initCode = parseInitPopupCode({
    typebot: publicId,
    customDomain,
    autoShowDelay,
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
          <PopupSettings
            onUpdateSettings={(settings) =>
              setAutoShowDelay(settings.autoShowDelay)
            }
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
