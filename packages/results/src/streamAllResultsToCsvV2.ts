import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { parseUniqueKey } from "@typebot.io/lib/parseUniqueKey";
import { byId } from "@typebot.io/lib/utils";
import {
  type TypebotV6,
  typebotV6Schema,
} from "@typebot.io/typebot/schemas/typebot";
import { Context, Effect, Option, Ref, Schema, Stream } from "effect";
import * as Papaparse from "papaparse";
import { z } from "zod";
import { convertResultsToTableData } from "./convertResultsToTableData";
import { parseBlockIdVariableIdMap } from "./parseBlockIdVariableIdMap";
import { parseColumnsOrder } from "./parseColumnsOrder";
import { parseResultHeader } from "./parseResultHeader";
import { resultWithAnswersSchema } from "./schemas/results";
import { ResultsService } from "./services/ResultsService";

export class ProgressReporterError extends Schema.TaggedError<ProgressReporterError>()(
  "@typebot/ProgressReporterError",
  {
    message: Schema.String,
  },
) {}

export class ProgressReporter extends Context.Tag("@typebot/ProgressReporter")<
  ProgressReporter,
  {
    readonly report: (
      progress: number,
    ) => Effect.Effect<void, ProgressReporterError>;
  }
>() {}

const BATCH_SIZE = 100;

export const streamResultsToCsvV2 = Effect.fn("streamResultsToCsvV2")(
  function* (
    typebot: Pick<
      TypebotV6,
      "id" | "groups" | "variables" | "resultsTablePreferences"
    >,
    { includeDeletedBlocks }: { includeDeletedBlocks?: boolean },
  ) {
    const progressReporter = yield* ProgressReporter;
    const resultsService = yield* ResultsService;

    const baseResultHeader = parseResultHeader({
      typebot: {
        groups: typebot.groups,
        variables: typebotV6Schema.shape.variables.parse(typebot?.variables),
      },
      linkedTypebots: [],
    });

    const deletedBlockHeaders = includeDeletedBlocks
      ? yield* getDeletedBlockHeaders({
          typebotId: typebot.id,
          existingHeaderIds: baseResultHeader.map((h) => h.id),
          groups: typebot.groups,
          resultsService,
        })
      : [];

    const resultHeader = [...baseResultHeader, ...deletedBlockHeaders];

    const blockIdVariableIdMap = parseBlockIdVariableIdMap(typebot.groups);

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

      currentHeaderIds.push(columnLabel);
      return currentHeaderIds;
    }, []);

    const csvHeaders = headerIds.map((headerId) => {
      const headerLabel = resultHeader.find(byId(headerId))?.label;
      return headerLabel ?? headerId;
    });

    const totalResultsToExport = yield* resultsService.count({
      where: {
        typebotId: typebot.id,
        hasStarted: true,
        isArchived: false,
      },
    });

    const totalRowsExportedRef = yield* Ref.make(0);

    // Create a stream of CSV chunks
    const csvStream = Stream.make(Papaparse.unparse([csvHeaders]) + "\n").pipe(
      Stream.concat(
        Stream.unfoldEffect(
          {
            processedCount: 0,
            lastCreatedAt: null as Date | null,
            processedIds: new Set<string>(),
          },
          Effect.fn(function* (state) {
            if (state.processedCount >= totalResultsToExport) {
              return Option.none();
            }

            const rawBatch = z.array(resultWithAnswersSchema).parse(
              (yield* resultsService.findMany({
                take: BATCH_SIZE,
                where: {
                  typebotId: typebot.id,
                  hasStarted: true,
                  isArchived: false,
                  ...(state.lastCreatedAt
                    ? { createdAt: { lte: state.lastCreatedAt } }
                    : {}),
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
              })).map((r) => ({
                ...r,
                answers: r.answersV2.concat(r.answers),
              })),
            );

            const batch = rawBatch.filter((r) => !state.processedIds.has(r.id));

            if (batch.length === 0) {
              return Option.none();
            }

            batch.forEach((r) => state.processedIds.add(r.id));

            const dataToUnparse = convertResultsToTableData({
              results: batch,
              headerCells: resultHeader,
              blockIdVariableIdMap,
            });

            const csvRows = dataToUnparse.map<{ [key: string]: string }>(
              (data) => {
                const newObject: { [key: string]: string } = {};
                headerIds?.forEach((headerId) => {
                  const headerLabel = resultHeader.find(byId(headerId))?.label;
                  if (!headerLabel) return;
                  const newKey = parseUniqueKey(
                    headerLabel,
                    Object.keys(newObject),
                  );
                  newObject[newKey] = data[headerId]?.plainText;
                });
                return newObject;
              },
            );

            const csvContent =
              csvRows.length > 0
                ? Papaparse.unparse(csvRows, { header: false }) + "\n"
                : "";

            const newProcessedCount = state.processedCount + batch.length;

            yield* Ref.set(totalRowsExportedRef, newProcessedCount);

            yield* progressReporter.report(
              Math.round((newProcessedCount / totalResultsToExport) * 100),
            );

            return Option.some([
              csvContent,
              {
                processedCount: newProcessedCount,
                lastCreatedAt: batch[batch.length - 1].createdAt,
                processedIds: state.processedIds,
              },
            ] as const);
          }),
        ),
      ),
      // Convert string chunks to Uint8Array
      Stream.mapEffect((chunk) =>
        Effect.sync(() => new TextEncoder().encode(chunk)),
      ),
    );

    return { csvStream, totalRowsExportedRef };
  },
);

const getDeletedBlockHeaders = Effect.fn("getDeletedBlockHeaders")(function* ({
  typebotId,
  existingHeaderIds,
  groups,
  resultsService,
}: {
  typebotId: string;
  existingHeaderIds: string[];
  groups: TypebotV6["groups"];
  resultsService: Context.Tag.Service<typeof ResultsService>;
}) {
  const allAnswerBlockIds =
    yield* resultsService.findDistinctAnswerBlockIds(typebotId);

  const existingBlockIds = new Set(
    groups.flatMap((group) => group.blocks.map((block) => block.id)),
  );
  const existingHeaderIdSet = new Set(existingHeaderIds);

  const deletedBlockIds = allAnswerBlockIds.filter(
    (blockId) =>
      !existingBlockIds.has(blockId) && !existingHeaderIdSet.has(blockId),
  );

  return deletedBlockIds.map((blockId) => ({
    id: blockId,
    label: `${blockId} (deleted block)`,
    blocks: [{ id: blockId, groupId: "" }],
    blockType: InputBlockType.TEXT,
  }));
});
