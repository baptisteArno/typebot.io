import { useState } from "react";
import { StandardSettings } from "../../../settings/StandardSettings";
import { InstallReactPackageSnippet } from "../InstallReactPackageSnippet";
import { ReactStandardSnippet } from "../ReactStandardSnippet";

export const ReactStandardInstructions = () => {
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
          <InstallReactPackageSnippet />
        </div>
      </li>
      <li>
        <div className="flex flex-col gap-4">
          <StandardSettings
            onUpdateWindowSettings={(settings) =>
              setInputValues({ ...settings })
            }
          />
          <ReactStandardSnippet {...inputValues} />
        </div>
      </li>
    </ol>
  );
};
