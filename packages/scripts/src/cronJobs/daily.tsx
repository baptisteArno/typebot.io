import { runScript } from "../cli";
import { cleanExpiredData } from "../helpers/cleanExpiredData";
import { trackAndReportYesterdaysResults } from "../helpers/trackAndReportYesterdaysResults";

export const main = async () => {
  await cleanExpiredData();
  await trackAndReportYesterdaysResults();
};

runScript(main);
