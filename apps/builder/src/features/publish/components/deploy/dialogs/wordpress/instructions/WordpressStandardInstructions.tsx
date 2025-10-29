import { env } from "@typebot.io/env";
import { useState } from "react";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { TextLink } from "@/components/TextLink";
import { isCloudProdInstance } from "@/helpers/isCloudProdInstance";
import packageJson from "../../../../../../../../../../packages/embeds/js/package.json";
import { StandardSettings } from "../../../settings/StandardSettings";

type Props = {
  publicId: string;
};

export const WordpressStandardInstructions = ({ publicId }: Props) => {
  const [windowSizes, setWindowSizes] = useState<{
    width?: string;
    height: string;
  }>({
    height: "100%",
    width: "100%",
  });

  const elementCode = parseWordpressShortcode({ ...windowSizes, publicId });

  return (
    <ol>
      <li>
        Install{" "}
        <TextLink href="https://wordpress.org/plugins/typebot/" isExternal>
          the official Typebot WordPress plugin
        </TextLink>
      </li>
      <li>
        <div className="flex flex-col gap-4">
          <StandardSettings
            onUpdateWindowSettings={(sizes) =>
              setWindowSizes({
                height: sizes.heightLabel,
                width: sizes.widthLabel,
              })
            }
          />
          <p>
            You can now place the following shortcode anywhere on your site:
          </p>
          <CodeEditor value={elementCode} lang="shell" isReadOnly />
          <p>
            Note: Your page templating system probably has a{" "}
            <code>Shortcode</code> element (if not, use a text element).
          </p>
        </div>
      </li>
    </ol>
  );
};

const parseWordpressShortcode = ({
  width,
  height,
  publicId,
}: {
  width?: string;
  height?: string;
  publicId: string;
}) => {
  return `[typebot typebot="${publicId}"${
    isCloudProdInstance()
      ? ""
      : ` host="${env.NEXT_PUBLIC_VIEWER_URL[0]}" lib_version="${packageJson.version}"${env.NEXT_PUBLIC_PARTYKIT_HOST ? ` ws_host="${env.NEXT_PUBLIC_PARTYKIT_HOST}"` : ""}`
  }${width ? ` width="${width}"` : ""}${height ? ` height="${height}"` : ""}]
`;
};
