import { JavascriptStandardSnippet } from "../../javascript/JavascriptStandardSnippet";

export const FramerStandardInstructions = () => (
  <ol>
    <li>
      Press <code>A</code> to open the <code>Add elements</code> panel
    </li>
    <li>
      <div className="flex flex-col gap-4">
        <p>
          Add an <code>Embed</code> element from the <code>components</code>{" "}
          section and paste this code:
        </p>
        <JavascriptStandardSnippet />
      </div>
    </li>
  </ol>
);
