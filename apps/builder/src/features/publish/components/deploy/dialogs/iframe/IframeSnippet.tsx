import { env } from "@typebot.io/env";
import parserHtml from "prettier/parser-html";
import prettier from "prettier/standalone";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";

type Props = {
  widthLabel: string;
  heightLabel: string;
  onCopied?: () => void;
  className?: string;
};

export const IframeSnippet = ({
  widthLabel,
  heightLabel,
  className,
}: Props) => {
  const { typebot } = useTypebot();
  const src = `${env.NEXT_PUBLIC_VIEWER_URL[0]}/${typebot?.publicId}`;
  const code = prettier.format(
    `<iframe src="${src}" style="border: none; width: ${widthLabel}; height: ${heightLabel}"></iframe>`,
    { parser: "html", plugins: [parserHtml] },
  );

  return (
    <CodeEditor value={code} lang="html" isReadOnly className={className} />
  );
};
