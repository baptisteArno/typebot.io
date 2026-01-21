import prisma from "@typebot.io/prisma";
import { Plan } from "@typebot.io/prisma/enum";
import { promptAndSetEnvironment } from "./utils";

/**
 * Creates workspaces for users who don't have any workspace.
 * This is needed after migrating from NextAuth to Better Auth,
 * as the workspace creation hook was not in place for existing users.
 */
const createMissingWorkspaces = async () => {
  await promptAndSetEnvironment("production");

  // Find all users who don't have any workspace
  const usersWithoutWorkspaces = await prisma.user.findMany({
    where: {
      workspaces: {
        none: {},
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  console.log(
    `Found ${usersWithoutWorkspaces.length} users without workspaces`,
  );

  if (usersWithoutWorkspaces.length === 0) {
    console.log("No users need workspace creation");
    return;
  }

  const adminEmails = process.env.ADMIN_EMAIL?.split(",") || [];
  const defaultPlan = (process.env.DEFAULT_WORKSPACE_PLAN as Plan) || Plan.FREE;

  for (const user of usersWithoutWorkspaces) {
    const plan = adminEmails.includes(user.email)
      ? Plan.UNLIMITED
      : defaultPlan;
    const workspaceName = user.name
      ? `${user.name}'s workspace`
      : "My workspace";

    console.log(`Creating workspace for ${user.email} with plan ${plan}...`);

    await prisma.workspace.create({
      data: {
        name: workspaceName,
        plan,
        members: {
          create: [{ role: "ADMIN", userId: user.id }],
        },
      },
    });

    console.log(`  ✓ Created workspace "${workspaceName}"`);
  }

  console.log("Done!");
};

createMissingWorkspaces();
