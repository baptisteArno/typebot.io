import { useState } from "react";
import { StandardSettings } from "../../../settings/StandardSettings";
import { JavascriptStandardSnippet } from "../JavascriptStandardSnippet";

export const JavascriptStandardInstructions = () => {
  const [inputValues, setInputValues] = useState<{
    heightLabel: string;
    widthLabel?: string;
  }>({
    heightLabel: "100%",
    widthLabel: "100%",
  });

  return (
    <div className="flex flex-col gap-4">
      <StandardSettings
        onUpdateWindowSettings={(settings) => setInputValues({ ...settings })}
      />
      <p>
        Paste this anywhere in the <code>{"<body>"}</code>:
      </p>
      <JavascriptStandardSnippet {...inputValues} />
    </div>
  );
};
