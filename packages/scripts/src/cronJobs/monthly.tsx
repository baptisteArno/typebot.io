import { cleanArchivedData } from "../helpers/cleanArchivedData";
import { resetBillingProps } from "../helpers/resetBillingProps";

export const main = async () => {
  await resetBillingProps();
  await cleanArchivedData();
};

main().then();
