import {
  assertProductionEnvironment,
  getRequiredInput,
  runScript,
} from "./cli";
import { destroyUser } from "./helpers/destroyUser";

const main = async () => {
  assertProductionEnvironment();
  await destroyUser(
    await getRequiredInput({ message: "User email?", name: "email" }),
  );
};

runScript(main);
