import { assertProductionEnvironment, runScript } from "./cli";
import { sendEmailCampaign } from "./sendEmailCampaign";

const main = async () => {
  if (process.env.NX_TASK_TARGET_CONFIGURATION === "production")
    assertProductionEnvironment({ requiresDatabase: false });
  else if (process.env.NX_TASK_TARGET_CONFIGURATION !== "local")
    throw new Error(
      "Run start through Nx with a local or production configuration",
    );

  await sendEmailCampaign();
};

runScript(main);
