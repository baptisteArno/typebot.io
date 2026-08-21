import { runScript } from "../cli";
import { checkAndReportLastHourResults } from "../helpers/checkAndReportLastHourResults";

export const main = async () => {
  await checkAndReportLastHourResults();
};

runScript(main);
