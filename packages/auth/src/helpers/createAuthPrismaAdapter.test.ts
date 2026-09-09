import { createHash } from "node:crypto";
import { Auth } from "@auth/core";
import { PrismaClient } from "@prisma/client";
import type {} from "@typebot.io/config/tests/globalSetup";
import { createPrismaAdapter } from "@typebot.io/prisma/createPrismaAdapter";
import { afterAll, afterEach, describe, expect, inject, it, vi } from "vitest";
import { createAuthPrismaAdapter } from "./createAuthPrismaAdapter";
import * as failedAttempts from "./recordFailedEmailSignInAttempt";

describe("email verification tokens on PostgreSQL", () => {
  const identifier = "login-attempts@example.com";
  const otherIdentifier = "other-login-attempts@example.com";
  const prisma = new PrismaClient({
    adapter: createPrismaAdapter(inject("pgContainerDatabaseUri")),
  });
  const concurrentPrisma = new PrismaClient({
    adapter: createPrismaAdapter(inject("pgContainerDatabaseUri")),
  });
  const useToken = createAuthPrismaAdapter(prisma).useVerificationToken;
  const useConcurrentToken =
    createAuthPrismaAdapter(concurrentPrisma).useVerificationToken;
  const createToken = createAuthPrismaAdapter(prisma).createVerificationToken;

  if (!useToken || !useConcurrentToken || !createToken)
    throw new Error("Verification token adapter methods are required");

  afterEach(async () => {
    vi.restoreAllMocks();
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: {
          in: [
            identifier,
            otherIdentifier,
            "whatsapp webhook",
            "user-id-changeEmail",
          ],
        },
      },
    });
  });

  afterAll(async () => {
    await Promise.all([prisma.$disconnect(), concurrentPrisma.$disconnect()]);
  });

  it.each([
    null,
    failedAttempts.INITIAL_EMAIL_SIGN_IN_FAILED_ATTEMPTS,
    failedAttempts.EMAIL_SIGN_IN_VERIFICATION_TOKEN_VALUE,
  ])("serializes the fifth failure and a correct candidate for marker %s", async (value) => {
    await prisma.verificationToken.create({
      data: {
        identifier,
        token: "correct",
        value,
        failedAttempts: 4,
        expires: new Date(Date.now() + 60_000),
      },
    });
    await createToken({
      identifier: otherIdentifier,
      token: "independent",
      expires: new Date(Date.now() + 60_000),
    });
    let reachedAccounting = false;
    const resumeAccounting = Promise.withResolvers<void>();
    const recordFailure = failedAttempts.recordFailedEmailSignInAttempt;
    // Pause after the real database has rejected a candidate, before its
    // failure is recorded. No storage result or transaction is mocked.
    vi.spyOn(
      failedAttempts,
      "recordFailedEmailSignInAttempt",
    ).mockImplementationOnce(async (...args) => {
      reachedAccounting = true;
      await resumeAccounting.promise;
      return recordFailure(...args);
    });
    const wrong = Promise.resolve(useToken({ identifier, token: "wrong" }));
    let correct: ReturnType<typeof useToken> | undefined;
    let correctSettled = false;
    let correctWaitedForAccounting = false;
    try {
      await vi.waitFor(() => expect(reachedAccounting).toBe(true));
      expect(
        await useConcurrentToken({
          identifier: otherIdentifier,
          token: "independent",
        }),
      ).toMatchObject({ token: "independent" });
      correct = Promise.resolve(
        useConcurrentToken({ identifier, token: "correct" }),
      ).finally(() => {
        correctSettled = true;
      });
      // Observe an actual PostgreSQL lock wait, or the vulnerable success.
      // This avoids relying on a sleep to assume that the request started.
      await vi.waitFor(async () => {
        const waiting = await prisma.$queryRaw<Array<{ waiting: boolean }>>`
            SELECT EXISTS (
              SELECT 1 FROM pg_stat_activity
              WHERE datname = current_database() AND wait_event_type = 'Lock'
                AND query LIKE '%VerificationToken%'
            ) AS waiting
          `;
        expect(correctSettled || waiting[0]?.waiting).toBe(true);
      });
      correctWaitedForAccounting = !correctSettled;
    } finally {
      resumeAccounting.resolve();
      await Promise.allSettled([wrong, correct]);
    }
    expect(await wrong).toBeNull();
    expect(await correct).toBeNull();
    expect(correctWaitedForAccounting).toBe(true);
    expect(
      await prisma.verificationToken.count({ where: { identifier } }),
    ).toBe(0);
  });

  it("counts concurrent failures across clients and retires all outstanding login codes", async () => {
    await prisma.verificationToken.createMany({
      data: ["first", "second"].map((token) => ({
        identifier,
        token,
        value: failedAttempts.EMAIL_SIGN_IN_VERIFICATION_TOKEN_VALUE,
        expires: new Date(Date.now() + 60_000),
      })),
    });
    expect(
      await Promise.all(
        Array.from({ length: 4 }, (_, index) =>
          (index % 2 ? useConcurrentToken : useToken)({
            identifier,
            token: `wrong-${index}`,
          }),
        ),
      ),
    ).toEqual([null, null, null, null]);
    expect(
      await prisma.verificationToken.findMany({
        where: { identifier },
        select: { failedAttempts: true },
      }),
    ).toEqual([{ failedAttempts: 4 }, { failedAttempts: 4 }]);
    expect(await useToken({ identifier, token: "fifth-wrong" })).toBeNull();
    expect(await useConcurrentToken({ identifier, token: "first" })).toBeNull();
    expect(
      await prisma.verificationToken.count({ where: { identifier } }),
    ).toBe(0);
  });

  it("accepts the correct code after four failures and consumes it only once across clients", async () => {
    await createToken({
      identifier,
      token: "correct",
      expires: new Date(Date.now() + 60_000),
    });
    for (let index = 0; index < 4; index++)
      expect(
        await useToken({ identifier, token: `wrong-${index}` }),
      ).toBeNull();
    const results = await Promise.all(
      Array.from({ length: 8 }, (_, index) =>
        (index % 2 ? useConcurrentToken : useToken)({
          identifier,
          token: "correct",
        }),
      ),
    );
    expect(results.filter(Boolean)).toHaveLength(1);
    expect(results.filter((result) => result === null)).toHaveLength(7);
    expect(
      await prisma.verificationToken.count({ where: { identifier } }),
    ).toBe(0);
  });

  it("preserves expiry for Auth.js and does not count failures against expired codes", async () => {
    const expires = new Date(Date.now() - 60_000);
    await createToken({ identifier, token: "expired", expires });
    expect(await useToken({ identifier, token: "wrong" })).toBeNull();
    expect(
      await prisma.verificationToken.findUnique({
        where: { token: "expired" },
      }),
    ).toMatchObject({ expires, failedAttempts: 0 });
    // Auth.js rejects this returned expiry before creating a session.
    expect(await useToken({ identifier, token: "expired" })).toMatchObject({
      expires,
    });
    expect(await useToken({ identifier, token: "expired" })).toBeNull();
  });

  it("rolls back accounting and propagates unexpected storage failures", async () => {
    await prisma.verificationToken.create({
      data: {
        identifier,
        token: "correct",
        value: failedAttempts.EMAIL_SIGN_IN_VERIFICATION_TOKEN_VALUE,
        failedAttempts: 4,
        expires: new Date(Date.now() + 60_000),
      },
    });
    const recordFailure = failedAttempts.recordFailedEmailSignInAttempt;
    vi.spyOn(
      failedAttempts,
      "recordFailedEmailSignInAttempt",
    ).mockImplementationOnce(async (...args) => {
      await recordFailure(...args);
      throw new Error("Accounting interrupted");
    });
    await expect(useToken({ identifier, token: "wrong" })).rejects.toThrow(
      "Accounting interrupted",
    );
    expect(
      await prisma.verificationToken.findUnique({
        where: { token: "correct" },
      }),
    ).toMatchObject({ failedAttempts: 4 });
    expect(
      await useConcurrentToken({ identifier, token: "correct" }),
    ).toMatchObject({ token: "correct" });
  });

  it("leaves other identifiers and non-login token purposes untouched", async () => {
    const tokens = [
      { identifier: otherIdentifier, token: "other-login", value: null },
      { identifier, token: "other-purpose", value: "new@example.com" },
      { identifier: "whatsapp webhook", token: "webhook", value: null },
      {
        identifier: "user-id-changeEmail",
        token: "change-email",
        value: "new@example.com",
      },
    ].map((row) => ({
      ...row,
      failedAttempts: 0,
      expires: new Date(Date.now() + 60_000),
    }));
    await prisma.verificationToken.createMany({ data: tokens });
    for (let index = 0; index < 5; index++) {
      await useToken({ identifier, token: "wrong" });
      await useToken({ identifier: "whatsapp webhook", token: "wrong" });
      await useToken({ identifier: "user-id-changeEmail", token: "wrong" });
    }
    for (const token of tokens) {
      expect(
        await prisma.verificationToken.findUnique({
          where: { token: token.token },
        }),
      ).toEqual(token);
      expect(
        await useToken({ identifier: token.identifier, token: token.token }),
      ).toEqual(token);
    }
  });

  it.each([
    "expired",
    "exhausted",
  ])("rejects a %s code through the Auth.js callback", async (state) => {
    const secret = "test-only-email-verification-secret";
    await createToken({
      identifier,
      token: createHash("sha256").update(`123456${secret}`).digest("hex"),
      expires: new Date(Date.now() + (state === "expired" ? -60_000 : 60_000)),
    });
    if (state === "exhausted")
      for (let index = 0; index < 5; index++)
        await useToken({ identifier, token: `wrong-${index}` });
    const logger = { error: vi.fn(), warn: vi.fn(), debug: vi.fn() };
    const response = await Auth(
      new Request(
        `http://localhost/api/auth/callback/email?email=${encodeURIComponent(identifier)}&token=123456`,
      ),
      {
        secret,
        trustHost: true,
        basePath: "/api/auth",
        adapter: createAuthPrismaAdapter(prisma),
        providers: [
          {
            id: "email",
            name: "Email",
            type: "email",
            sendVerificationRequest: async () => {},
          },
        ],
        logger,
      },
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "http://localhost/api/auth/error?error=Verification",
    );
    expect(response.headers.get("set-cookie") ?? "").not.toContain(
      "authjs.session-token",
    );
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ type: "Verification" }),
    );
    expect(
      await prisma.verificationToken.count({ where: { identifier } }),
    ).toBe(0);
  });
});
