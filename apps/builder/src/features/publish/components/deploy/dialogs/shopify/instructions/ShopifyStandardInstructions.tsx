import { useState } from "react";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { StandardSettings } from "../../../settings/StandardSettings";
import {
  parseStandardElementCode,
  parseStandardHeadCode,
} from "../../javascript/JavascriptStandardSnippet";

type Props = {
  publicId: string;
};

export const ShopifyStandardInstructions = ({ publicId }: Props) => {
  const [windowSizes, setWindowSizes] = useState<{
    width?: string;
    height: string;
  }>({
    height: "100%",
    width: "100%",
  });

  const headCode = parseStandardHeadCode(publicId);

  const elementCode = parseStandardElementCode(
    windowSizes.width,
    windowSizes.height,
  );

  return (
    <ol>
      <li>
        On your shop dashboard in the <code>Themes</code> page, click on{" "}
        <code>Actions {">"} Edit code</code>
      </li>
      <li>
        <div className="flex flex-col gap-4">
          <p>
            In <code>Layout {">"} theme.liquid</code> file, paste this code just
            before the closing <code>{"<head>"}</code> tag:
          </p>

          <CodeEditor value={headCode} lang="html" isReadOnly />
        </div>
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
            Place an element on which the typebot will go in any file in the{" "}
            <code>{"<body>"}</code>:
          </p>
          <CodeEditor value={elementCode} lang="html" isReadOnly />
        </div>
      </li>
    </ol>
  );
};
