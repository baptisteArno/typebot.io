import type { PopupProps } from "@typebot.io/js";
import parserHtml from "prettier/parser-html";
import prettier from "prettier/standalone";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { parseInitPopupCode } from "../../snippetParsers/popup";
import { typebotImportCode } from "../../snippetParsers/shared";

type Props = Pick<PopupProps, "autoShowDelay">;

export const JavascriptPopupSnippet = ({ autoShowDelay }: Props) => {
  const { typebot } = useTypebot();
  const snippet = prettier.format(
    createSnippet({
      typebot: typebot?.publicId ?? "",
      customDomain: typebot?.customDomain,
      autoShowDelay,
    }),
    {
      parser: "html",
      plugins: [parserHtml],
    },
  );
  return <CodeEditor value={snippet} lang="html" isReadOnly />;
};

const createSnippet = (
  params: PopupProps & { customDomain: string | null | undefined },
): string => {
  const jsCode = parseInitPopupCode(params);
  return `<script type="module">${typebotImportCode}

${jsCode}</script>`;
};
