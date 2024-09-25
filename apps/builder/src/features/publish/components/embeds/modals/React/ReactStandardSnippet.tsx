import { CodeEditor } from "@/components/inputs/CodeEditor";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import parserBabel from "prettier/parser-babel";
import prettier from "prettier/standalone";
import { parseReactBotProps } from "../../snippetParsers";

type ReactStandardSnippetProps = { widthLabel?: string; heightLabel: string };

export const ReactStandardSnippet = ({
  widthLabel,
  heightLabel,
}: ReactStandardSnippetProps) => {
  const { typebot } = useTypebot();
  const snippet = prettier.format(
    `import { Standard } from "@typebot.io/react";

      const App = () => {
        return <Standard ${parseReactBotProps({
          typebot: typebot?.publicId ?? "",
        })} style={{width: "${widthLabel}", height: "${heightLabel}"}} />
      }`,
    {
      parser: "babel",
      plugins: [parserBabel],
    },
  );
  return <CodeEditor value={snippet} lang="javascript" isReadOnly />;
};
