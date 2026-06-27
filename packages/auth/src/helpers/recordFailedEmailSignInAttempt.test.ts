import { describe, expect, it } from "vitest";
import {
  EMAIL_SIGN_IN_VERIFICATION_TOKEN_VALUE,
  INITIAL_EMAIL_SIGN_IN_FAILED_ATTEMPTS,
  recordFailedEmailSignInAttempt,
} from "./recordFailedEmailSignInAttempt";

type StoredVerificationToken = {
  identifier: string;
  token: string;
  value: string | null;
  failedAttempts: number;
  expires: Date;
};

type VerificationTokenStore = Parameters<
  typeof recordFailedEmailSignInAttempt
>[0];

type VerificationTokenWhere = Parameters<
  VerificationTokenStore["verificationToken"]["updateMany"]
>[0]["where"];

describe("recordFailedEmailSignInAttempt", () => {
  it("removes outstanding email login tokens after repeated failed attempts", async () => {
    const store = createVerificationTokenStore([
      {
        identifier: "user@example.com",
        token: "valid-token",
        value: INITIAL_EMAIL_SIGN_IN_FAILED_ATTEMPTS,
        failedAttempts: 0,
        expires: new Date(Date.now() + 60_000),
      },
    ]);

    await recordFailedEmailSignInAttempt(store, "user@example.com");
    await recordFailedEmailSignInAttempt(store, "user@example.com");
    await recordFailedEmailSignInAttempt(store, "user@example.com");
    await recordFailedEmailSignInAttempt(store, "user@example.com");

    expect(store.rows).toHaveLength(1);

    await recordFailedEmailSignInAttempt(store, "user@example.com");

    expect(store.rows).toHaveLength(0);
  });

  it("also retires legacy unmarked email login tokens", async () => {
    const store = createVerificationTokenStore([
      {
        identifier: "user@example.com",
        token: "valid-token",
        value: null,
        failedAttempts: 0,
        expires: new Date(Date.now() + 60_000),
      },
    ]);

    await recordFailedEmailSignInAttempt(store, "user@example.com");
    await recordFailedEmailSignInAttempt(store, "user@example.com");
    await recordFailedEmailSignInAttempt(store, "user@example.com");
    await recordFailedEmailSignInAttempt(store, "user@example.com");
    await recordFailedEmailSignInAttempt(store, "user@example.com");

    expect(store.rows).toHaveLength(0);
  });

  it("leaves non-login verification rows untouched", async () => {
    const store = createVerificationTokenStore([
      {
        identifier: "whatsapp webhook",
        token: "other-token",
        value: null,
        failedAttempts: 0,
        expires: new Date(Date.now() + 60_000),
      },
      {
        identifier: "user-id-changeEmail",
        token: "change-email-token",
        value: "new@example.com",
        failedAttempts: 0,
        expires: new Date(Date.now() + 60_000),
      },
    ]);

    await recordFailedEmailSignInAttempt(store, "whatsapp webhook");
    await recordFailedEmailSignInAttempt(store, "user-id-changeEmail");

    expect(store.rows).toHaveLength(2);
  });

  it("counts parallel failed attempts independently", async () => {
    const store = createVerificationTokenStore([
      {
        identifier: "user@example.com",
        token: "valid-token",
        value: EMAIL_SIGN_IN_VERIFICATION_TOKEN_VALUE,
        failedAttempts: 0,
        expires: new Date(Date.now() + 60_000),
      },
    ]);

    await Promise.all(
      Array.from({ length: 5 }, () =>
        recordFailedEmailSignInAttempt(store, "user@example.com"),
      ),
    );

    expect(store.rows).toHaveLength(0);
  });
});

const createVerificationTokenStore = (
  initialRows: StoredVerificationToken[],
) => {
  const rows = [...initialRows];

  const store = {
    rows,
    verificationToken: {
      updateMany: ({
        where,
        data,
      }: Parameters<
        VerificationTokenStore["verificationToken"]["updateMany"]
      >[0]) => {
        const matchingRows = rows.filter((row) => matchesWhere(row, where));

        for (const row of matchingRows)
          row.failedAttempts += data.failedAttempts.increment;

        return Promise.resolve({ count: matchingRows.length });
      },
      deleteMany: ({
        where,
      }: Parameters<
        VerificationTokenStore["verificationToken"]["deleteMany"]
      >[0]) => {
        const remainingRows = rows.filter((row) => !matchesWhere(row, where));
        const deletedCount = rows.length - remainingRows.length;

        rows.splice(0, rows.length, ...remainingRows);

        return Promise.resolve({ count: deletedCount });
      },
    },
  };

  return store;
};

const matchesWhere = (
  row: StoredVerificationToken,
  where: VerificationTokenWhere,
) => {
  if (row.identifier !== where.identifier) return false;
  if (where.expires && row.expires <= where.expires.gt) return false;
  if (
    where.failedAttempts?.lt !== undefined &&
    row.failedAttempts >= where.failedAttempts.lt
  )
    return false;
  if (
    where.failedAttempts?.gte !== undefined &&
    row.failedAttempts < where.failedAttempts.gte
  )
    return false;
  return where.OR.some((clause) => {
    if (clause.value === null) return row.value === null;
    if (typeof clause.value === "string") return row.value === clause.value;
    return row.value?.startsWith(clause.value.startsWith) ?? false;
  });
};
