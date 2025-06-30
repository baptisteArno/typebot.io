import prisma from "@typebot.io/prisma/withReadReplica";
import ky from "ky";

const main = async () => {
  let url = `https://eu.posthog.com/api/projects/${process.env.POSTHOG_PROJECT_ID}/cohorts/${process.env.POSTHOG_INACTIVE_USERS_COHORT_ID}/persons`;
  const inactiveUserIds: string[] = [];
  do {
    const { userIds, nextUrl } = await getInactiveUserIds(url);
    url = nextUrl;
    inactiveUserIds.push(...userIds);
  } while (url);

  const users = await prisma.user.findMany({
    where: {
      id: { in: inactiveUserIds },
    },
    select: {
      id: true,
      workspaces: {
        where: {
          role: "ADMIN",
        },
        select: {
          workspace: {
            select: {
              id: true,
              members: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
      },
    },
  });

  for (const user of users) {
    const allWorkspacesAreInactive = user.workspaces.every((workspace) =>
      workspace.workspace.members.every((member) => member.userId === user.id),
    );
    if (allWorkspacesAreInactive) {
      console.log(user.id);
    }
  }
};

async function getInactiveUserIds(url: string) {
  try {
    const response = await ky.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`,
      },
    });

    const data = await response.json<{
      results: {
        distinct_ids: string[];
      }[];
      next: string;
    }>();
    return {
      userIds: data.results.flatMap((result) => result.distinct_ids[0]),
      nextUrl: data.next,
    };
  } catch (error) {
    console.error("Error fetching cohort:", error);
    throw error;
  }
}

main();
