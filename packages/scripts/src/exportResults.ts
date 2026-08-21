import { streamAllResultsToCsv } from "@typebot.io/results/streamAllResultsToCsv";
import cliProgress from "cli-progress";
import {
  assertProductionEnvironment,
  getRequiredInput,
  runScript,
} from "./cli";

export const exportResults = async () => {
  assertProductionEnvironment();
  const typebotId = await getRequiredInput({
    message: "Typebot ID?",
    name: "typebot-id",
  });

  const progressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic,
  );

  progressBar.start(100, 0);

  const result = await streamAllResultsToCsv(typebotId, {
    onProgressUpdate: (progress) => {
      progressBar.update(progress);
    },
    writeStreamPath: "logs/results.csv",
  });

  if (result.status === "error") {
    console.error(result.message);
    return;
  }

  progressBar.stop();
  console.log("Results exported successfully");
};

runScript(exportResults);
