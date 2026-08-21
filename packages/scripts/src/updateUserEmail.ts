import prisma from "@typebot.io/prisma";
import {
  assertProductionEnvironment,
  confirmAction,
  getRequiredInput,
  runScript,
} from "./cli";
import { destroyUser } from "./helpers/destroyUser";

const updateUserEmail = async () => {
  assertProductionEnvironment();

  const currentUserEmail = await getRequiredInput({
    message: "Current email?",
    name: "current-email",
  });

  const newEmail = await getRequiredInput({
    message: "New email?",
    name: "new-email",
  });

  if (
    !(await confirmAction({
      message: `Change ${currentUserEmail} to ${newEmail} in production?`,
    }))
  )
    return;

  const existingUserWithNewEmail = await prisma.user.findUnique({
    where: {
      email: newEmail,
    },
  });

  if (existingUserWithNewEmail) {
    console.log(`User with email ${newEmail} already exists`);
    console.log(JSON.stringify(existingUserWithNewEmail, null, 2));

    await destroyUser(newEmail);
  }

  const user = await prisma.user.update({
    where: {
      email: currentUserEmail,
    },
    data: {
      email: newEmail,
    },
  });

  console.log(JSON.stringify(user, null, 2));
};

runScript(updateUserEmail);
