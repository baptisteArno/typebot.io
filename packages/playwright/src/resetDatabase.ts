import { setupDatabase, teardownDatabase } from "./databaseSetup";

const main = async () => {
  console.log("Tearing down database…");
  await teardownDatabase();
  console.log("Setting up database…");
  await setupDatabase();
  console.log("Done.");
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
