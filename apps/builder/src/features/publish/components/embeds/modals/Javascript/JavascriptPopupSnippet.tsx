import { CodeEditor } from "@/components/inputs/CodeEditor";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import type { PopupProps } from "@typebot.io/js";
import parserHtml from "prettier/parser-html";
import prettier from "prettier/standalone";
import {
  parseApiHostValue,
  parseInitPopupCode,
  typebotImportCode,
} from "../../snippetParsers";

type Props = Pick<PopupProps, "autoShowDelay">;

export const JavascriptPopupSnippet = ({ autoShowDelay }: Props) => {
  const { typebot } = useTypebot();
  const snippet = prettier.format(
    createSnippet({
      typebot: typebot?.publicId ?? "",
      apiHost: parseApiHostValue(typebot?.customDomain),
      autoShowDelay,
    }),
    {
      parser: "html",
      plugins: [parserHtml],
    },
  );
  return <CodeEditor value={snippet} lang="html" isReadOnly />;
};

const createSnippet = (params: PopupProps): string => {
  const jsCode = parseInitPopupCode(params);
  return `<script type="module">${typebotImportCode}

${jsCode}</script>`;
};
