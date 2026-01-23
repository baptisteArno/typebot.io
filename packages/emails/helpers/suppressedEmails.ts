import { isNotEmpty } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import { PrismaClientService, PrismaService } from "@typebot.io/prisma/effect";
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

export const normalizeRecipientEmails = (to: SendMailOptions["to"]) =>
  Array.from(new Set(extractEmailsFromRecipients(to)));

export const listSuppressedEmails = (emails: string[]) =>
  Effect.gen(function* () {
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
  });

export const listSuppressedEmailsForRecipients = (
  recipients: SendMailOptions["to"],
) => listSuppressedEmails(extractEmailsFromRecipients(recipients));

export const runListSuppressedEmailsForRecipients = (
  recipients: SendMailOptions["to"],
) => runWithPrisma(listSuppressedEmailsForRecipients(recipients));

const SUPPRESSION_THRESHOLD = 2;

export const recordTransientGeneralBounces = (
  emails: string[],
  webhookId?: string,
) =>
  Effect.gen(function* () {
    const normalized = normalizeEmailList(emails);
    if (!normalized.length) return;
    const prisma = yield* PrismaService;
    const existingEntries = yield* prisma.suppressedEmail.findMany({
      where: { email: { in: normalized } },
      select: {
        email: true,
        transientGeneralBounceCount: true,
        suppressedAt: true,
        lastWebhookId: true,
      },
    });
    const existingByEmail = new Map(
      existingEntries.map((entry) => [entry.email, entry]),
    );
    const now = new Date();

    yield* Effect.forEach(
      normalized,
      (email) =>
        Effect.gen(function* () {
          const existing = existingByEmail.get(email);
          if (webhookId && existing?.lastWebhookId === webhookId) return;
          const nextCount = (existing?.transientGeneralBounceCount ?? 0) + 1;
          const shouldSuppress = nextCount >= SUPPRESSION_THRESHOLD;
          const suppressedAt = shouldSuppress
            ? (existing?.suppressedAt ?? now)
            : (existing?.suppressedAt ?? null);

          if (existing) {
            yield* prisma.suppressedEmail.update({
              where: { email },
              data: {
                transientGeneralBounceCount: nextCount,
                suppressedAt,
                lastWebhookId: webhookId ?? existing.lastWebhookId,
              },
            });
            return;
          }

          yield* prisma.suppressedEmail.create({
            data: {
              email,
              transientGeneralBounceCount: nextCount,
              suppressedAt,
              lastWebhookId: webhookId ?? null,
            },
          });
        }),
      { concurrency: 1 },
    );
  });

export const runRecordTransientGeneralBounces = (
  emails: string[],
  webhookId?: string,
) => runWithPrisma(recordTransientGeneralBounces(emails, webhookId));
