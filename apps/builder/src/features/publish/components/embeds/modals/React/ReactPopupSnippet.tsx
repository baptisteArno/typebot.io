import { CodeEditor } from "@/components/inputs/CodeEditor";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import type { PopupProps } from "@typebot.io/js";
import parserBabel from "prettier/parser-babel";
import prettier from "prettier/standalone";
import { parseReactPopupProps } from "../../snippetParsers";

export const ReactPopupSnippet = ({
  autoShowDelay,
}: Pick<PopupProps, "autoShowDelay">) => {
  const { typebot } = useTypebot();

  const snippet = prettier.format(
    `import { Popup } from "@typebot.io/react";

      const App = () => {
        return <Popup ${parseReactPopupProps({
          typebot: typebot?.publicId ?? "",
          autoShowDelay,
        })}/>;
      }`,
    {
      parser: "babel",
      plugins: [parserBabel],
    },
  );

  return <CodeEditor value={snippet} lang="javascript" isReadOnly />;
};
