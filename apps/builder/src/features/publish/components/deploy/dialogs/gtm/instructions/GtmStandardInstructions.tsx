import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import { useState } from "react";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { StandardSettings } from "../../../settings/StandardSettings";
import {
  parseStandardElementCode,
  parseStandardHeadCode,
} from "../../javascript/JavascriptStandardSnippet";

export const GtmStandardInstructions = ({
  publicId,
}: Pick<Typebot, "publicId">) => {
  const [windowSizes, setWindowSizes] = useState<{
    height: string;
    width?: string;
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
        On your GTM account dashboard, click on <code>Add a new tag</code>
      </li>
      <li>
        Choose <code>Custom HTML tag</code> type
      </li>
      <li>
        Check <code>Support document.write</code>
      </li>
      <li>
        <div className="flex flex-col gap-4">
          <p>Paste the code below:</p>
          <CodeEditor value={headCode} isReadOnly lang="html" />
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
            On your web page, you need to have an element on which the typebot
            will go:
          </p>
          <CodeEditor value={elementCode} isReadOnly lang="html" />
        </div>
      </li>
    </ol>
  );
};
