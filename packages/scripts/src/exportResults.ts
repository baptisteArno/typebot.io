import * as p from "@clack/prompts";
import { parseUniqueKey } from "@typebot.io/lib/parseUniqueKey";
import { byId } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import { convertResultsToTableData } from "@typebot.io/results/convertResultsToTableData";
import { parseBlockIdVariableIdMap } from "@typebot.io/results/parseBlockIdVariableIdMap";
import { parseColumnsOrder } from "@typebot.io/results/parseColumnsOrder";
import { parseResultHeader } from "@typebot.io/results/parseResultHeader";
import { resultWithAnswersSchema } from "@typebot.io/results/schemas/results";
import type { TypebotV6 } from "@typebot.io/typebot/schemas/typebot";
import { z } from "@typebot.io/zod";
import cliProgress from "cli-progress";
import { createWriteStream } from "fs";
import { unparse } from "papaparse";

/**
 * Exports results from a typebot to a CSV file using optimized cursor-based pagination.
 */
const exportResults = async () => {
  const typebotId = (await p.text({
    message: "Typebot ID?",
  })) as string;

  if (!typebotId || typeof typebotId !== "string") {
    console.log("No id provided");
    return;
  }

  const progressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic,
  );

  const typebot = (await prisma.typebot.findUnique({
    where: {
      id: typebotId,
    },
  })) as TypebotV6 | null;

  if (!typebot) {
    console.log("No typebot found");
    return;
  }

  const totalResultsToExport = await prisma.result.count({
    where: {
      typebotId,
      hasStarted: true,
      isArchived: false,
    },
  });

  progressBar.start(totalResultsToExport, 0);

  const resultHeader = parseResultHeader(typebot, []);
  const blockIdVariableIdMap = parseBlockIdVariableIdMap(typebot?.groups);

  const headerIds = parseColumnsOrder(
    typebot?.resultsTablePreferences?.columnsOrder,
    resultHeader,
  ).reduce<string[]>((currentHeaderIds, columnId) => {
    if (typebot?.resultsTablePreferences?.columnsVisibility[columnId] === false)
      return currentHeaderIds;
    const columnLabel = resultHeader.find(
      (headerCell) => headerCell.id === columnId,
    )?.id;
    if (!columnLabel) return currentHeaderIds;
    return [...currentHeaderIds, columnLabel];
  }, []);

  const csvHeaders = headerIds.map((headerId) => {
    const headerLabel = resultHeader.find(byId(headerId))?.label;
    return headerLabel ?? headerId;
  });

  const csvStream = createWriteStream("logs/results.csv");
  csvStream.write(unparse([csvHeaders]) + "\n");

  const batchSize = 500;
  let lastCreatedAt: Date | null = null;
  const processedIds = new Set<string>();
  let processedCount = 0;

  while (processedCount < totalResultsToExport) {
    const rawBatch = z.array(resultWithAnswersSchema).parse(
      (
        await prisma.result.findMany({
          take: batchSize,
          where: {
            typebotId,
            hasStarted: true,
            isArchived: false,
            ...(lastCreatedAt ? { createdAt: { lte: lastCreatedAt } } : {}),
          },
          orderBy: {
            createdAt: "desc",
          },
          include: {
            answers: {
              select: {
                content: true,
                blockId: true,
              },
            },
            answersV2: {
              select: {
                content: true,
                blockId: true,
              },
            },
          },
        })
      ).map((r) => ({ ...r, answers: r.answersV2.concat(r.answers) })),
    );

    const batch = rawBatch.filter((r) => !processedIds.has(r.id));

    if (batch.length === 0) break;

    batch.forEach((r) => processedIds.add(r.id));

    const dataToUnparse = convertResultsToTableData({
      results: batch,
      headerCells: resultHeader,
      blockIdVariableIdMap,
    });

    const csvRows = dataToUnparse.map<{ [key: string]: string }>((data) => {
      const newObject: { [key: string]: string } = {};
      headerIds?.forEach((headerId) => {
        const headerLabel = resultHeader.find(byId(headerId))?.label;
        if (!headerLabel) return;
        const newKey = parseUniqueKey(headerLabel, Object.keys(newObject));
        newObject[newKey] = data[headerId]?.plainText;
      });
      return newObject;
    });

    if (csvRows.length > 0) {
      const csvContent = unparse(csvRows, { header: false });
      csvStream.write(csvContent + "\n");
    }

    lastCreatedAt = batch[batch.length - 1].createdAt;
    processedCount += batch.length;
    progressBar.update(processedCount);
  }

  csvStream.end();
  progressBar.stop();
};

exportResults();
