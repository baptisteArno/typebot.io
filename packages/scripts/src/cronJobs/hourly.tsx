import { checkAndReportLastHourResults } from "../helpers/checkAndReportLastHourResults";

export const main = async () => {
  await checkAndReportLastHourResults();
};

main().then();
