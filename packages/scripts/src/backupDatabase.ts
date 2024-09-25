import { exec } from "child_process";
import { promptAndSetEnvironment } from "./utils";

const backupDatabase = async () => {
  await promptAndSetEnvironment();
  exec(
    `pg_dump ${process.env.DATABASE_URL} -F c > dump.tar`,
    (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    },
  );
};

backupDatabase();
