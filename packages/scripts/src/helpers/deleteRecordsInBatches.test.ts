import { describe, expect, it, mock } from "bun:test";
import { Effect } from "effect";
import { deleteRecordsInBatches } from "./deleteRecordsInBatches";

describe("deleteRecordsInBatches", () => {
  it("reduces timed-out batches without skipping any records", async () => {
    const deletedRecordIds: string[] = [];
    const deleteRecords = mock(async (recordIds: string[]) => {
      if (recordIds.length > 2)
        throw new Error(
          "code = Aborted desc = transaction 123: ended (unlocked closed connection)",
        );
      deletedRecordIds.push(...recordIds);
      return { count: recordIds.length };
    });

    const totalDeletedRecords = await Effect.runPromise(
      deleteRecordsInBatches({
        recordIds: ["a", "b", "c", "d", "e"],
        deleteRecords,
        label: "Test",
      }),
    );

    expect(totalDeletedRecords).toBe(5);
    expect(deletedRecordIds).toEqual(["a", "b", "c", "d", "e"]);
    expect(
      deleteRecords.mock.calls.map(([recordIds]) => recordIds.length),
    ).toEqual([5, 2, 2, 1]);
  });

  it("stops after three failures for a single record", async () => {
    const deleteRecords = mock(async () => {
      throw new Error("context deadline exceeded");
    });

    await expect(
      Effect.runPromise(
        deleteRecordsInBatches({
          recordIds: ["a"],
          deleteRecords,
          label: "Test",
        }),
      ),
    ).rejects.toThrow("context deadline exceeded");
    expect(deleteRecords).toHaveBeenCalledTimes(3);
  });

  it("does not retry permanent errors or process later records", async () => {
    const deleteRecords = mock(async () => {
      throw new Error("permission denied");
    });

    await expect(
      Effect.runPromise(
        deleteRecordsInBatches({
          recordIds: ["a", "b"],
          deleteRecords,
          label: "Test",
        }),
      ),
    ).rejects.toThrow("permission denied");
    expect(deleteRecords).toHaveBeenCalledTimes(1);
  });

  it("counts actual deletions when records are no longer eligible", async () => {
    const deleteRecords = mock(async () => ({ count: 1 }));

    expect(
      await Effect.runPromise(
        deleteRecordsInBatches({
          recordIds: ["expired", "reactivated"],
          deleteRecords,
          label: "Test",
        }),
      ),
    ).toBe(1);
    expect(deleteRecords).toHaveBeenCalledTimes(1);
  });
});
