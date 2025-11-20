import * as p from "@clack/prompts";
import { streamAllResultsToCsv } from "@typebot.io/results/streamAllResultsToCsv";
import cliProgress from "cli-progress";

export const exportResults = async () => {
  const typebotId = (await p.text({
    message: "Typebot ID?",
  })) as string;

  if (!typebotId || typeof typebotId !== "string") {
    console.log("No id provided");
    return;
  }

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
