import { exec } from "child_process";
import { promptAndSetEnvironment } from "./utils";

const restoreDatabase = async () => {
  await promptAndSetEnvironment();

  exec(
    `pg_restore -d ${process.env.DATABASE_URL} -c dump.tar`,
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

restoreDatabase();
