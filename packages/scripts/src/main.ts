import { getYesterdayChurnSummary } from "./churnAgent/getYesterdayChurnSummary";

(async () => {
  await getYesterdayChurnSummary({
    onSummaryGenerated: async (summary) => {
      console.log("Generated summary for workspace:", summary);
    },
  });
})();
