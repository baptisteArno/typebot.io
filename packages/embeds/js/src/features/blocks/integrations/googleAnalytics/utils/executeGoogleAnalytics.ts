import type { GoogleAnalyticsBlock } from "@typebot.io/blocks-integrations/googleAnalytics/schema";
import { sendGaEvent } from "@/lib/gtag";

export const executeGoogleAnalyticsBlock = async (
  options: GoogleAnalyticsBlock["options"],
) => {
  if (!options?.trackingId) return;
  sendGaEvent(options);
};
