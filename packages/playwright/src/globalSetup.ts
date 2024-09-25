import { setupDatabase, teardownDatabase } from "./databaseSetup";

export const globalSetup = async () => {
  await teardownDatabase();
  await setupDatabase();
};
