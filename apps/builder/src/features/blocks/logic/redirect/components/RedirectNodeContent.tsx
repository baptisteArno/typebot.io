import type { RedirectBlock } from "@typebot.io/blocks-logic/redirect/schema";
import { cx } from "@typebot.io/ui/lib/cva";

type Props = { url: NonNullable<RedirectBlock["options"]>["url"] };

export const RedirectNodeContent = ({ url }: Props) => (
  <p
    className={cx(
      "truncate line-clamp-2",
      url ? "text-gray-12" : "text-gray-9",
    )}
  >
    {url ? `Redirect to ${url}` : "Configure..."}
  </p>
);
