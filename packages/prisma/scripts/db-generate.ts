import { executePrismaCommand } from "./executeCommand";
import { patchEffectClient } from "./patchEffectClient";

const run = async () => {
  await executePrismaCommand("prisma generate --no-hints", { force: true });
  await patchEffectClient();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
