import type { GoogleAnalyticsBlock } from "@typebot.io/blocks-integrations/googleAnalytics/schema";
import { cx } from "@typebot.io/ui/lib/cva";

type Props = {
  action: NonNullable<GoogleAnalyticsBlock["options"]>["action"];
};

export const GoogleAnalyticsNodeBody = ({ action }: Props) => (
  <p className={cx("truncate", action ? "text-gray-12" : "text-gray-9")}>
    {action ? `Track "${action}"` : "Configure..."}
  </p>
);
