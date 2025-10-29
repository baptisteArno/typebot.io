import { defaultScriptOptions } from "@typebot.io/blocks-logic/script/constants";
import type { ScriptBlock } from "@typebot.io/blocks-logic/script/schema";
import { cx } from "@typebot.io/ui/lib/cva";

type Props = {
  options: ScriptBlock["options"];
};

export const ScriptNodeContent = ({
  options: { name, content } = {},
}: Props) => (
  <p className={cx("truncate", content ? "text-gray-12" : "text-gray-9")}>
    {content ? `Run ${name ?? defaultScriptOptions.name}` : "Configure..."}
  </p>
);
