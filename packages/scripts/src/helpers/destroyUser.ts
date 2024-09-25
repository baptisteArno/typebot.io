import { writeFileSync } from "fs";
import { confirm, isCancel, text } from "@clack/prompts";
import {
  removeObjectsFromUser,
  removeObjectsFromWorkspace,
} from "@typebot.io/lib/s3/removeObjectsRecursively";
import prisma from "@typebot.io/prisma";

export const destroyUser = async (userEmail?: string) => {
  const email =
    userEmail ??
    (await text({
      message: "User email?",
    }));

  if (!email || isCancel(email)) {
    console.log("No email provided");
    return;
  }

  const workspaces = await prisma.workspace.findMany({
    where: {
      members: { every: { user: { email } } },
    },
    include: {
      members: { select: { user: { select: { email: true } }, role: true } },
      typebots: {
        select: {
          results: {
            select: { id: true },
          },
        },
      },
    },
  });

  console.log(`Found ${workspaces.length} workspaces`);

  if (
    workspaces.some((w) =>
      w.members.some((m) => m.user.email && m.user.email !== email),
    )
  ) {
    console.log(
      `Some workspaces have other members. Something is wrong. Logging and exiting...`,
    );
    writeFileSync(
      "logs/workspaces-issue.json",
      JSON.stringify(workspaces, null, 2),
    );
    return;
  }

  console.log(
    "Workspaces:",
    JSON.stringify(
      workspaces.map((w) => ({
        id: w.id,
        plan: w.plan,
        members: w.members,
      })),
      null,
      2,
    ),
  );

  const proceed = await confirm({ message: "Proceed?" });
  if (!proceed || typeof proceed !== "boolean") {
    console.log("Aborting");
    return;
  }

  for (const workspace of workspaces) {
    const totalResults = workspace.typebots.reduce(
      (acc, typebot) => acc + typebot.results.length,
      0,
    );

    if (totalResults > 0) {
      console.log(
        `Workspace ${workspace.name} has ${totalResults} results. We should delete them first...`,
      );
      const proceed = await confirm({ message: "Proceed?" });
      if (!proceed || typeof proceed !== "boolean") {
        console.log("Aborting");
        return;
      }
    }
    for (const typebot of workspace.typebots.filter(
      (t) => t.results.length > 0,
    )) {
      for (const result of typebot.results) {
        await prisma.result.deleteMany({ where: { id: result.id } });
      }
    }
    await prisma.workspace.delete({ where: { id: workspace.id } });
    await removeObjectsFromWorkspace(workspace.id);
  }

  const user = await prisma.user.delete({ where: { email } });
  await removeObjectsFromUser(user.id);

  console.log(`User deleted.`, JSON.stringify(user, null, 2));
};
