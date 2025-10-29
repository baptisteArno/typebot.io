import { useState } from "react";
import { StandardSettings } from "../../../settings/StandardSettings";
import { InstallNextjsPackageSnippet } from "../InstallNextjsPackageSnippet";
import { NextjsStandardSnippet } from "../NextjsStandardSnippet";

export const NextjsStandardInstructions = () => {
  const [inputValues, setInputValues] = useState<{
    widthLabel?: string;
    heightLabel: string;
  }>({
    heightLabel: "100%",
    widthLabel: "100%",
  });

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
          <StandardSettings
            onUpdateWindowSettings={(settings) =>
              setInputValues({ ...settings })
            }
          />
          <NextjsStandardSnippet {...inputValues} />
        </div>
      </li>
    </ol>
  );
};
