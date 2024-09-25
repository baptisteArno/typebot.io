import { sendGaEvent } from "@/lib/gtag";
import type { GoogleAnalyticsBlock } from "@typebot.io/blocks-integrations/googleAnalytics/schema";

export const executeGoogleAnalyticsBlock = async (
  options: GoogleAnalyticsBlock["options"],
) => {
  if (!options?.trackingId) return;
  sendGaEvent(options);
};
