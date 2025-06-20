import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { executePostHogQuery } from "./executePostHogQuery";

export const getLandingPageVisitors = async (): Promise<number> => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  try {
    const query = `
      SELECT count(DISTINCT distinct_id) AS unique_visitors
      FROM events
      WHERE event = '$pageview'
      AND toDate(timestamp) = toDate(now() - INTERVAL 1 DAY)
    `;

    const response = await executePostHogQuery(query);
    const uniqueVisitors = response.results?.[0]?.[0] ?? 0;

    return typeof uniqueVisitors === "number" ? uniqueVisitors : 0;
  } catch (error) {
    console.error(
      "Error fetching landing page visitor metrics:",
      await parseUnknownError({ err: error }),
    );
    return 0;
  }
};
