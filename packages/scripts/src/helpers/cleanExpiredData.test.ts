import { describe, expect, it, mock } from "bun:test";

const chatSessionFindMany = mock(async () => [
  { id: "expired" },
  { id: "reactivated" },
]);
const chatSessionDeleteMany = mock(async () => ({ count: 1 }));
const sessionFindMany = mock(async () => [{ id: "expired-user-session" }]);
const sessionDeleteMany = mock(async () => ({ count: 1 }));
const verificationTokenFindMany = mock(async () => [
  { token: "expired-token" },
]);
const verificationTokenDeleteMany = mock(async () => ({ count: 1 }));
const primaryClient = {
  chatSession: { findMany: chatSessionFindMany },
  session: { findMany: sessionFindMany },
  verificationToken: { findMany: verificationTokenFindMany },
};

mock.module("@typebot.io/prisma/withReadReplica", () => ({
  default: {
    $primary: () => primaryClient,
    chatSession: { deleteMany: chatSessionDeleteMany },
    session: { deleteMany: sessionDeleteMany },
    verificationToken: { deleteMany: verificationTokenDeleteMany },
  },
}));

const { cleanExpiredData } = await import("./cleanExpiredData");

describe("cleanExpiredData", () => {
  it("uses fixed UTC cutoffs and rechecks expiration before deleting", async () => {
    const result = await cleanExpiredData(new Date("2026-09-30T16:00:00.000Z"));
    const chatSessionCutoff = new Date("2026-09-28T00:00:00.000Z");
    const authenticationCutoff = new Date("2026-09-27T00:00:00.000Z");

    expect(chatSessionFindMany).toHaveBeenCalledWith({
      where: { updatedAt: { lte: chatSessionCutoff } },
      select: { id: true },
      take: 80000,
    });
    expect(chatSessionDeleteMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["expired", "reactivated"] },
        updatedAt: { lte: chatSessionCutoff },
      },
    });
    expect(sessionDeleteMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["expired-user-session"] },
        expires: { lte: authenticationCutoff },
      },
    });
    expect(verificationTokenDeleteMany).toHaveBeenCalledWith({
      where: {
        token: { in: ["expired-token"] },
        expires: { lte: authenticationCutoff },
      },
    });
    expect(result).toEqual({
      totalDeletedChatSessions: 1,
      totalDeletedAppSessions: 1,
      totalDeletedVerificationTokens: 1,
    });
  });
});
