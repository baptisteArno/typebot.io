import { CodeEditor } from "@/components/inputs/CodeEditor";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import type { BubbleProps } from "@typebot.io/js";
import parserBabel from "prettier/parser-babel";
import prettier from "prettier/standalone";
import { parseReactBubbleProps } from "../../snippetParsers/bubble";

export const NextjsBubbleSnippet = ({
  theme,
  previewMessage,
}: Pick<BubbleProps, "theme" | "previewMessage">) => {
  const { typebot } = useTypebot();

  const snippet = prettier.format(
    `import { Bubble } from "@typebot.io/react";

      const App = () => {
        return <Bubble ${parseReactBubbleProps({
          typebot: typebot?.publicId ?? "",
          customDomain: typebot?.customDomain,
          theme,
          previewMessage,
        })}/>
      }`,
    {
      parser: "babel",
      plugins: [parserBabel],
    },
  );

  return <CodeEditor value={snippet} lang="javascript" isReadOnly />;
};
