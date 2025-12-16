import { parseGroups } from "@typebot.io/groups/helpers/parseGroups";
import type { GroupV6 } from "@typebot.io/groups/schemas";
import { parseUniqueKey } from "@typebot.io/lib/parseUniqueKey";
import { byId } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import { typebotV6Schema } from "@typebot.io/typebot/schemas/typebot";
import { z } from "@typebot.io/zod";
import { createWriteStream, type PathLike } from "fs";
import { unparse } from "papaparse";
import type { Writable } from "stream";
import { convertResultsToTableData } from "./convertResultsToTableData";
import { parseBlockIdVariableIdMap } from "./parseBlockIdVariableIdMap";
import { parseColumnsOrder } from "./parseColumnsOrder";
import { parseResultHeader } from "./parseResultHeader";
import { resultWithAnswersSchema } from "./schemas/results";

const BATCH_SIZE = 500;

export const streamAllResultsToCsv = async (
  typebotId: string,
  {
    writeStreamPath,
    writableStream,
    onProgressUpdate,
  }: {
    writeStreamPath?: PathLike;
    writableStream?: Writable;
    onProgressUpdate: (progress: number) => void;
  },
): Promise<
  | {
      status: "error";
      message: string;
    }
  | {
      status: "success";
    }
> => {
  if (!writeStreamPath && !writableStream)
    return { status: "error", message: "No stream provided" };

  const typebot = await prisma.typebot.findUnique({
    where: {
      id: typebotId,
    },
    select: {
      version: true,
      groups: true,
      variables: true,
      resultsTablePreferences: true,
    },
  });

  const totalResultsToExport = await prisma.result.count({
    where: {
      typebotId,
      hasStarted: true,
      isArchived: false,
    },
  });

  if (!typebot) {
    writableStream?.end();
    return { status: "error", message: "Typebot not found" };
  }

  if (Number(typebot.version) < 6) {
    writableStream?.end();
    return { status: "error", message: "Typebot is not at least v6" };
  }

  const groups = parseGroups(typebot.groups, {
    typebotVersion: typebot.version,
  }) as GroupV6[];
  const resultHeader = parseResultHeader({
    typebot: {
      groups,
      variables: typebotV6Schema.shape.variables.parse(typebot?.variables),
    },
    linkedTypebots: [],
  });
  const blockIdVariableIdMap = parseBlockIdVariableIdMap(groups);

  const resultsTablePreferences =
    typebotV6Schema.shape.resultsTablePreferences.parse(
      typebot?.resultsTablePreferences,
    );
  const headerIds = parseColumnsOrder(
    resultsTablePreferences?.columnsOrder,
    resultHeader,
  ).reduce<string[]>((currentHeaderIds, columnId) => {
    if (resultsTablePreferences?.columnsVisibility[columnId] === false)
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

  const csvStream = writableStream ?? createWriteStream(writeStreamPath!);

  return new Promise<
    { status: "error"; message: string } | { status: "success" }
  >((resolve, reject) => {
    csvStream.on("error", (error: unknown) => {
      reject(error);
    });

    csvStream.on("finish", () => {
      resolve({ status: "success" });
    });

    const processResults = async () => {
      csvStream.write(unparse([csvHeaders]) + "\n");

      let lastCreatedAt: Date | null = null;
      const processedIds = new Set<string>();
      let processedCount = 0;

      while (processedCount < totalResultsToExport) {
        const rawBatch = z.array(resultWithAnswersSchema).parse(
          (
            await prisma.result.findMany({
              take: BATCH_SIZE,
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
        onProgressUpdate(
          Math.round((processedCount / totalResultsToExport) * 100),
        );
      }

      csvStream.end();
    };

    processResults().catch((err) => {
      csvStream.destroy(err);
      reject(err);
    });
  });
};
