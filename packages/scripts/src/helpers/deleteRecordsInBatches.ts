import { Effect, Result } from "effect";

export const deleteRecordsInBatches = Effect.fn("deleteRecordsInBatches")(
  function* ({
    recordIds,
    deleteRecords,
    label,
  }: {
    recordIds: readonly string[];
    deleteRecords: (recordIds: string[]) => PromiseLike<{ count: number }>;
    label: string;
  }) {
    let batchSize = 100;
    let offset = 0;
    let totalDeletedRecords = 0;
    let singleRecordFailures = 0;

    while (offset < recordIds.length) {
      const batch = recordIds.slice(offset, offset + batchSize);
      const startedAt = Date.now();
      console.log(
        `[cleanExpiredData] ${label}: deleting ${batch.length} records at offset ${offset}...`,
      );
      const result = yield* Effect.tryPromise({
        try: () => deleteRecords(batch),
        catch: (error) => error,
      }).pipe(Effect.result);

      if (Result.isFailure(result)) {
        if (!isRetryableCleanupError(result.failure))
          return yield* Effect.fail(result.failure);

        if (batch.length === 1) {
          singleRecordFailures += 1;
          if (singleRecordFailures >= 3)
            return yield* Effect.fail(result.failure);
        }

        batchSize = Math.max(1, Math.floor(batch.length / 2));
        console.warn(
          `[cleanExpiredData] ${label}: transient delete failure after ${((Date.now() - startedAt) / 1000).toFixed(1)}s; retrying offset ${offset} with ${batchSize} records.`,
        );
        yield* Effect.sleep("1 second");
        continue;
      }

      totalDeletedRecords += result.success.count;
      offset += batch.length;
      singleRecordFailures = 0;
      console.log(
        `[cleanExpiredData] ${label}: deleted ${result.success.count}/${batch.length} records in ${((Date.now() - startedAt) / 1000).toFixed(1)}s (${offset}/${recordIds.length} processed).`,
      );
    }

    return totalDeletedRecords;
  },
);

const isRetryableCleanupError = (error: unknown) => {
  if (!(error instanceof Error)) return false;
  return /code = Aborted.*transaction|transaction.*(?:closed connection|timeout|timed out|exceeded)|context deadline exceeded|deadlock|lock wait timeout|ECONNRESET|ETIMEDOUT|fetch failed/i.test(
    error.message,
  );
};
