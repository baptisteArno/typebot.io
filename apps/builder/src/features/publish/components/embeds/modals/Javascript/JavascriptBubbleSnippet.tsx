import { CodeEditor } from "@/components/inputs/CodeEditor";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import type { BubbleProps } from "@typebot.io/js";
import parserHtml from "prettier/parser-html";
import prettier from "prettier/standalone";
import { parseInitBubbleCode } from "../../snippetParsers/bubble";
import { typebotImportCode } from "../../snippetParsers/shared";

type Props = Pick<BubbleProps, "theme" | "previewMessage">;

export const JavascriptBubbleSnippet = ({ theme, previewMessage }: Props) => {
  const { typebot } = useTypebot();

  const snippet = prettier.format(
    `<script type="module">${typebotImportCode}

${parseInitBubbleCode({
  typebot: typebot?.publicId ?? "",
  customDomain: typebot?.customDomain,
  theme,
  previewMessage,
})}</script>`,
    {
      parser: "html",
      plugins: [parserHtml],
    },
  );

  return <CodeEditor value={snippet} lang="html" isReadOnly />;
};
