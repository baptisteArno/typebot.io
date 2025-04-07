import type { BotProps } from "@typebot.io/js";
import parserBabel from "prettier/parser-babel";
import prettier from "prettier/standalone";
import { parseBotProps } from "./shared";

export const parseInitStandardCode = ({
  typebot,
  customDomain,
}: Pick<BotProps, "typebot"> & { customDomain: string | undefined | null }) => {
  const botProps = parseBotProps({ typebot, customDomain });

  return prettier.format(`Typebot.initStandard({${botProps}});`, {
    parser: "babel",
    plugins: [parserBabel],
  });
};
