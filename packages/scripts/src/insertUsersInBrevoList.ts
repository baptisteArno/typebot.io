import prisma from "@typebot.io/prisma";
import ky, { HTTPError } from "ky";
import {
  assertProductionEnvironment,
  confirmAction,
  getRequiredInput,
  runScript,
} from "./cli";

const insertUsersInBrevoList = async () => {
  assertProductionEnvironment();

  const listId = await getRequiredInput({
    message: "List ID?",
    name: "list-id",
    validate: (value) =>
      Number.isInteger(Number(value)) && Number(value) > 0
        ? undefined
        : "Expected a positive integer",
  });

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 5);

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const users = await prisma.user.findMany({
    where: {
      lastActivityAt: {
        gte: threeMonthsAgo,
      },
      createdAt: {
        lt: oneMonthAgo,
      },
    },
    select: {
      email: true,
    },
  });

  console.log("Inserting users", users.length);

  const proceed = await confirmAction({ message: "Proceed?" });
  if (!proceed) {
    console.log("Aborting");
    return;
  }

  try {
    await ky.post("https://api.brevo.com/v3/contacts/import", {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
      },
      json: {
        listIds: [Number(listId)],
        updateExistingContacts: true,
        jsonBody: users.map((email) => ({
          email,
        })),
      },
    });
  } catch (err) {
    if (err instanceof HTTPError) {
      console.log(await err.response.text());
      return;
    }
    console.log(err);
  }
};

runScript(insertUsersInBrevoList);
