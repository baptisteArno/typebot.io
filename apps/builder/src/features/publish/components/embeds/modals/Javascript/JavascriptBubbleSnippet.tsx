import { CodeEditor } from "@/components/inputs/CodeEditor";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import type { BubbleProps } from "@typebot.io/js";
import parserHtml from "prettier/parser-html";
import prettier from "prettier/standalone";
import {
  parseApiHostValue,
  parseInitBubbleCode,
  typebotImportCode,
} from "../../snippetParsers";

type Props = Pick<BubbleProps, "theme" | "previewMessage">;

export const JavascriptBubbleSnippet = ({ theme, previewMessage }: Props) => {
  const { typebot } = useTypebot();

  const snippet = prettier.format(
    `<script type="module">${typebotImportCode}

${parseInitBubbleCode({
  typebot: typebot?.publicId ?? "",
  apiHost: parseApiHostValue(typebot?.customDomain),
  theme: {
    ...theme,
    chatWindow: {
      backgroundColor: typebot?.theme.general?.background?.content ?? "#fff",
    },
  },
  previewMessage,
})}</script>`,
    {
      parser: "html",
      plugins: [parserHtml],
    },
  );

  return <CodeEditor value={snippet} lang="html" isReadOnly />;
};
