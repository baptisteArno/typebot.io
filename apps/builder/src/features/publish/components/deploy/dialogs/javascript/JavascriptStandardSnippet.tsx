import { CodeEditor } from "@/components/inputs/CodeEditor";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import parserHtml from "prettier/parser-html";
import prettier from "prettier/standalone";
import { typebotImportCode } from "../../snippetParsers/shared";
import { parseInitStandardCode } from "../../snippetParsers/standard";

type Props = {
  widthLabel?: string;
  heightLabel?: string;
};

export const JavascriptStandardSnippet = ({
  widthLabel,
  heightLabel,
}: Props) => {
  const { typebot } = useTypebot();

  const snippet = prettier.format(
    `${parseStandardHeadCode(typebot?.publicId, typebot?.customDomain)}
      ${parseStandardElementCode(widthLabel, heightLabel)}`,
    {
      parser: "html",
      plugins: [parserHtml],
    },
  );

  return <CodeEditor value={snippet} lang="html" isReadOnly />;
};

export const parseStandardHeadCode = (
  publicId?: string | null,
  customDomain?: string | null,
) =>
  prettier.format(
    `<script type="module">${typebotImportCode};

${parseInitStandardCode({
  typebot: publicId ?? "",
  customDomain,
})}</script>`,
    { parser: "html", plugins: [parserHtml] },
  );

export const parseStandardElementCode = (width?: string, height?: string) => {
  if (!width && !height) return "<typebot-standard></typebot-standard>";
  return prettier.format(
    `<typebot-standard style="${width ? `width: ${width}; ` : ""}${
      height ? `height: ${height}; ` : ""
    }"></typebot-standard>`,
    { parser: "html", plugins: [parserHtml] },
  );
};
