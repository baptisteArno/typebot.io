import { JavascriptStandardSnippet } from "../../javascript/JavascriptStandardSnippet";

export const WixStandardInstructions = () => {
  return (
    <ol>
      <li>
        In the Wix Website Editor:
        <code>
          Add {">"} Embed Code {">"} Embed HTML
        </code>
      </li>
      <li>
        <div className="flex flex-col gap-4">
          <p>
            Click on <code>Enter code</code> and paste this code:
          </p>
          <JavascriptStandardSnippet widthLabel="100%" heightLabel="100%" />
        </div>
      </li>
    </ol>
  );
};
