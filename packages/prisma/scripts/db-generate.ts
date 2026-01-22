import { executePrismaCommand } from "./executeCommand";
import { patchEffectClient } from "./patchEffectClient";

const run = async () => {
  await executePrismaCommand("prisma generate", { force: true });
  console.log("Patching effect client...");
  await patchEffectClient();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
