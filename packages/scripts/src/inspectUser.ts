import prisma from "@typebot.io/prisma";
import {
  assertProductionEnvironment,
  getBooleanInput,
  getIdentifierInput,
  runScript,
} from "./cli";

const inspectUser = async () => {
  assertProductionEnvironment();

  const { type, value } = await getIdentifierInput({
    message: "Select way",
    options: [
      { label: "ID", name: "id" },
      { label: "Email", name: "email" },
    ],
  });

  const user = await prisma.user.findFirst({
    where: {
      [type]: value,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      lastActivityAt: true,
      company: true,
      onboardingCategories: true,
      termsAcceptedAt: true,
      workspaces: {
        select: {
          workspace: {
            select: {
              id: true,
              name: true,
              plan: true,
              isVerified: true,
              stripeId: true,
              isSuspended: true,
              isPastDue: true,
              isQuarantined: true,
              members: {
                select: {
                  role: true,
                  user: {
                    select: {
                      email: true,
                    },
                  },
                },
              },
              additionalStorageIndex: true,
              typebots: {
                orderBy: {
                  updatedAt: "desc",
                },
                select: {
                  id: true,
                  name: true,
                  createdAt: true,
                  updatedAt: true,
                  riskLevel: true,
                  publishedTypebot: {
                    select: {
                      typebot: {
                        select: { publicId: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  console.log(JSON.stringify(user, null, 2));

  const computeResults = await getBooleanInput({
    defaultValue: false,
    flag: "compute-results",
    message: "Compute collected results?",
  });

  if (!computeResults) return;

  console.log("Computing collected results...");

  for (const workspace of user?.workspaces ?? []) {
    for (const typebot of workspace.workspace.typebots) {
      const resultsCount = await prisma.result.count({
        where: {
          typebotId: typebot.id,
          isArchived: false,
          hasStarted: true,
        },
      });

      if (resultsCount === 0) continue;

      console.log(
        `Typebot "${typebot.name}" (${typebot.id}) has ${resultsCount} collected results`,
      );
    }
  }
};

runScript(inspectUser);
