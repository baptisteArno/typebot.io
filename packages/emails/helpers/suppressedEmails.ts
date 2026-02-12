import { isNotEmpty } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import { PrismaClientService, PrismaService } from "@typebot.io/prisma/effect";
import { PrismaClientKnownRequestError } from "@typebot.io/prisma/enum";
import { Effect, Layer } from "effect";
import type { SendMailOptions } from "nodemailer";

const PrismaLayer = Layer.provide(
  PrismaService.Default,
  Layer.succeed(PrismaClientService, prisma),
);

const runWithPrisma = <A, E>(effect: Effect.Effect<A, E, PrismaService>) =>
  Effect.runPromise(effect.pipe(Effect.provide(PrismaLayer)));

const normalizeEmail = (value: string) => {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return "";
  const match = trimmed.match(/<([^>]+)>/);
  const address = match?.[1] ?? trimmed;
  const cleaned = address.replace(/[<>]/g, "").trim();
  if (!cleaned) return "";
  const [local, domain] = cleaned.split("@");
  if (!domain) return cleaned;
  return `${local}@${domain.split(",")[0].trim()}`;
};

const extractEmailsFromString = (value: string) =>
  value
    .split(",")
    .map((entry) => normalizeEmail(entry))
    .filter(isNotEmpty);

const extractEmailsFromRecipients = (value: unknown): string[] => {
  if (!value) return [];
  if (typeof value === "string") return extractEmailsFromString(value);
  if (Array.isArray(value))
    return value.flatMap((entry) => extractEmailsFromRecipients(entry));
  if (typeof value === "object" && "address" in value) {
    const address = value.address;
    if (typeof address === "string") return extractEmailsFromString(address);
  }
  return [];
};

const normalizeEmailList = (emails: string[]) =>
  Array.from(new Set(emails.map(normalizeEmail).filter(isNotEmpty)));

type RecipientAddress = {
  name: string;
  address: string;
};

const isRecipientAddress = (value: unknown): value is RecipientAddress =>
  typeof value === "object" &&
  value !== null &&
  "address" in value &&
  typeof value.address === "string" &&
  "name" in value &&
  typeof value.name === "string";

export const normalizeRecipientEmails = (to: SendMailOptions["to"]) =>
  Array.from(new Set(extractEmailsFromRecipients(to)));

const filterRecipientsString = (value: string, suppressed: Set<string>) => {
  const entries = value
    .split(",")
    .map((entry) => entry.trim())
    .filter(isNotEmpty);
  const remaining = entries.filter(
    (entry) => !suppressed.has(normalizeEmail(entry)),
  );
  if (remaining.length === 0) return "";
  return remaining.join(", ");
};

export const filterSuppressedRecipients = (
  recipients: SendMailOptions["to"],
  suppressedEmails: string[],
) => {
  if (!recipients) return undefined;
  if (suppressedEmails.length === 0) return recipients;
  const suppressed = new Set(suppressedEmails.map(normalizeEmail));

  if (typeof recipients === "string") {
    const filtered = filterRecipientsString(recipients, suppressed);
    if (!filtered) return undefined;
    return filtered;
  }

  if (Array.isArray(recipients)) {
    const recipientsList = recipients.filter(
      (entry): entry is string | RecipientAddress =>
        typeof entry === "string" || isRecipientAddress(entry),
    );
    const filtered: Array<string | RecipientAddress> = [];
    for (const entry of recipientsList) {
      if (typeof entry === "string") {
        const filteredEntry = filterRecipientsString(entry, suppressed);
        if (!filteredEntry) continue;
        filtered.push(filteredEntry);
        continue;
      }
      const filteredAddress = filterRecipientsString(entry.address, suppressed);
      if (!filteredAddress) continue;
      filtered.push({ ...entry, address: filteredAddress });
    }
    if (filtered.length === 0) return undefined;
    return filtered;
  }

  if (!isRecipientAddress(recipients)) return recipients;
  const filteredAddress = filterRecipientsString(
    recipients.address,
    suppressed,
  );
  if (!filteredAddress) return undefined;
  return { ...recipients, address: filteredAddress };
};

export const listSuppressedEmails = Effect.fn("listSuppressedEmails")(
  function* (emails: string[]) {
    const normalized = normalizeEmailList(emails);
    if (!normalized.length) return [];
    const prisma = yield* PrismaService;
    const suppressed = yield* prisma.suppressedEmail.findMany({
      where: {
        email: { in: normalized },
        suppressedAt: { not: null },
      },
      select: { email: true },
    });
    return suppressed.map((entry) => entry.email);
  },
);

export const listSuppressedEmailsForRecipients = (
  recipients: SendMailOptions["to"],
) => listSuppressedEmails(extractEmailsFromRecipients(recipients));

export const runListSuppressedEmailsForRecipients = (
  recipients: SendMailOptions["to"],
) => runWithPrisma(listSuppressedEmailsForRecipients(recipients));

const SUPPRESSION_THRESHOLD = 2;

export const recordTransientGeneralBounces = Effect.fn(
  "recordTransientGeneralBounces",
)(function* (emails: string[], webhookId?: string) {
  const normalized = normalizeEmailList(emails);
  if (!normalized.length) return;
  const prisma = yield* PrismaService;
  const now = new Date();

  yield* Effect.forEach(
    normalized,
    Effect.fn(function* (email) {
      const updateWhere = webhookId
        ? { email, NOT: { lastWebhookId: webhookId } }
        : { email };
      const updateData = webhookId
        ? {
            transientGeneralBounceCount: { increment: 1 },
            lastWebhookId: webhookId,
          }
        : { transientGeneralBounceCount: { increment: 1 } };
      const createData = {
        email,
        transientGeneralBounceCount: 1,
        suppressedAt: null,
        lastWebhookId: webhookId ?? null,
      };

      const updated = yield* prisma.suppressedEmail.updateMany({
        where: updateWhere,
        data: updateData,
      });

      if (updated.count === 0) {
        const created = yield* prisma.suppressedEmail
          .create({ data: createData })
          .pipe(
            Effect.as(true),
            Effect.catchAll((error) => {
              if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === "P2002"
              )
                return Effect.succeed(false);
              return Effect.fail(error);
            }),
          );
        if (!created)
          yield* prisma.suppressedEmail.updateMany({
            where: updateWhere,
            data: updateData,
          });
      }

      yield* prisma.suppressedEmail.updateMany({
        where: {
          email,
          suppressedAt: null,
          transientGeneralBounceCount: { gte: SUPPRESSION_THRESHOLD },
        },
        data: { suppressedAt: now },
      });
    }),
    { concurrency: 1 },
  );
});

export const runRecordTransientGeneralBounces = (
  emails: string[],
  webhookId?: string,
) => runWithPrisma(recordTransientGeneralBounces(emails, webhookId));
