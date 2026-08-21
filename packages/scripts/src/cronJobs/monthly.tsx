import { runScript } from "../cli";
import { cleanArchivedData } from "../helpers/cleanArchivedData";
import { resetBillingProps } from "../helpers/resetBillingProps";

export const main = async () => {
  await resetBillingProps();
  await cleanArchivedData();
};

runScript(main);
