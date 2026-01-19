import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { statsSchema } from "@typebot.io/results/schemas/answers";
import { z } from "zod";
import { edgeWithTotalVisitsSchema, totalAnswersSchema } from "../schemas";
import {
  getInDepthAnalyticsDataInputSchema,
  handleGetInDepthAnalyticsData,
} from "./handleGetInDepthAnalyticsData";
import { getStatsInputSchema, handleGetStats } from "./handleGetStats";

export const analyticsRouter = {
  getInDepthAnalyticsData: authenticatedProcedure
    .route({
      method: "GET",
      path: "/v1/typebots/{typebotId}/analytics/inDepthData",
      summary:
        "List total answers in blocks and off-default paths visited edges",
      tags: ["Analytics"],
    })
    .input(getInDepthAnalyticsDataInputSchema)
    .output(
      z.object({
        totalAnswers: z.array(totalAnswersSchema),
        offDefaultPathVisitedEdges: z.array(edgeWithTotalVisitsSchema),
      }),
    )
    .handler(handleGetInDepthAnalyticsData),

  getStats: authenticatedProcedure
    .route({
      method: "GET",
      path: "/v1/typebots/{typebotId}/analytics/stats",
      summary: "Get results stats",
      tags: ["Analytics"],
    })
    .input(getStatsInputSchema)
    .output(z.object({ stats: statsSchema }))
    .handler(handleGetStats),
};
