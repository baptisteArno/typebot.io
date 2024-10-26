import { readFileSync } from "fs";
import { IntegrationBlockType } from "@typebot.io/blocks-integrations/constants";
import { parseGroups } from "@typebot.io/groups/schemas";
import prisma from "@typebot.io/prisma";
import { Plan } from "@typebot.io/prisma/enum";
import { SingleBar } from "cli-progress";
import { parse } from "papaparse";

const main = async () => {
  const fileContent = readFileSync("./src/files/topTwo.csv").toString();
  const topTypebots = parse<{
    id: string;
    total_results: number;
  }>(fileContent, { header: true });

  console.log("processing", topTypebots.data.length, "typebots...");

  console.log(topTypebots.data);

  const bar = new SingleBar({});

  bar.start(topTypebots.data.length, 0);

  let i = 0;
  const updatedGroupsList = [];
  for (const { id } of topTypebots.data) {
    bar.update(i++);

    const publicTypebot = await prisma.publicTypebot.findUnique({
      where: {
        typebotId: id,
      },
      select: {
        version: true,
        groups: true,
        typebot: {
          select: {
            workspace: {
              select: {
                plan: true,
              },
            },
          },
        },
      },
    });

    if (!publicTypebot) continue;
    if (publicTypebot.typebot.workspace.plan !== Plan.FREE) continue;

    const groups = parseGroups(publicTypebot.groups, {
      typebotVersion: publicTypebot.version,
    });

    let wasUpdated = false;
    const updatedGroups = groups.map((group) => {
      return {
        ...group,
        blocks: group.blocks.map((block) => {
          if (
            block.type === IntegrationBlockType.EMAIL &&
            block.options?.credentialsId === "default"
          ) {
            wasUpdated = true;
            return {
              ...block,
              options: {
                ...block.options,
                credentialsId: undefined,
              },
            };
          }
          return block;
        }),
      };
    });

    updatedGroupsList.push(updatedGroups);

    if (wasUpdated) {
      console.log("Updating...", id);
      await prisma.publicTypebot.update({
        where: {
          typebotId: id,
        },
        data: {
          groups: updatedGroups,
        },
      });
    }
  }

  bar.stop();
};

main().then();
