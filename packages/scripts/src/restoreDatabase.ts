import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { confirmAction, promptAndSetEnvironment, runScript } from "./cli";

const restoreDatabase = async () => {
  const environment = await promptAndSetEnvironment();
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

  if (
    !(await confirmAction({
      message: `Replace data in the ${environment} database from dump.tar?`,
    }))
  )
    return;

  const { stdout, stderr } = await promisify(execFile)("pg_restore", [
    "-d",
    process.env.DATABASE_URL,
    "-c",
    "dump.tar",
  ]);
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
};

runScript(restoreDatabase);
