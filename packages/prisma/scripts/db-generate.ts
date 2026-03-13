import { executePrismaCommand } from "./executeCommand";

const run = async () => {
  await executePrismaCommand("prisma generate --no-hints", { force: true });
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
