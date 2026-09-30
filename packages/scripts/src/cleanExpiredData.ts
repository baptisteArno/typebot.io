import {
  assertProductionEnvironment,
  confirmAction,
  getRequiredInput,
  runScript,
} from "./cli";
import { cleanExpiredData as runCleanup } from "./helpers/cleanExpiredData";

const cleanExpiredData = async () => {
  assertProductionEnvironment();
  const cleanupDate = await getRequiredInput({
    name: "date",
    message: "Cleanup date (YYYY-MM-DD)?",
    validate: (value) => {
      const parsedDate = new Date(`${value}T00:00:00.000Z`);
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== value
      )
        return "Expected a valid date in YYYY-MM-DD format";
    },
  });
  if (
    !(await confirmAction({
      message: `Clean expired production data for ${cleanupDate} (UTC)?`,
    }))
  )
    return;

  const result = await runCleanup(new Date(`${cleanupDate}T00:00:00.000Z`));
  console.log(JSON.stringify({ cleanupDate, ...result }, null, 2));
};

runScript(cleanExpiredData);
