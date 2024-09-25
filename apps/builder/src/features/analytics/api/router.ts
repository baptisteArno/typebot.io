import { router } from "@/helpers/server/trpc";
import { getInDepthAnalyticsData } from "./getInDepthAnalyticsData";
import { getStats } from "./getStats";

export const analyticsRouter = router({
  getInDepthAnalyticsData,
  getStats,
});
