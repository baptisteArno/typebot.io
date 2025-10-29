import type { WaitBlock } from "@typebot.io/blocks-logic/wait/schema";
import { cx } from "@typebot.io/ui/lib/cva";

type Props = {
  options: WaitBlock["options"];
};

export const WaitNodeContent = ({
  options: { secondsToWaitFor } = {},
}: Props) => (
  <p
    className={cx(
      secondsToWaitFor ? "text-gray-12" : "text-gray-9",
      "truncate",
    )}
  >
    {secondsToWaitFor ? `Wait for ${secondsToWaitFor}s` : "Configure..."}
  </p>
);
