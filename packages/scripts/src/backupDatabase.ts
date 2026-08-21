import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { promptAndSetEnvironment, runScript } from "./cli";

const backupDatabase = async () => {
  await promptAndSetEnvironment();
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

  const { stdout, stderr } = await promisify(execFile)("pg_dump", [
    process.env.DATABASE_URL,
    "-F",
    "c",
    "-f",
    "dump.tar",
  ]);
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
};

runScript(backupDatabase);
