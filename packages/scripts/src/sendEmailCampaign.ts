import fs from "node:fs/promises";
import { setTimeout as sleep } from "node:timers/promises";
import { sendEmail } from "@typebot.io/emails/helpers/sendEmail";
import pLimit from "p-limit";
import Papa from "papaparse";
import { z } from "zod";

const DEFAULT_CSV_PATH =
  "/Users/baptistearno/Downloads/typebot-ask-assistant-deprecation-recipients-2026-07-04.csv";
const MIGRATION_DOC_URL =
  "https://docs.typebot.io/editor/blocks/integrations/openai#ask-model";

const ENGLISH_SUBJECT = "Action needed: migrate your Ask Assistant blocks";
const FRENCH_SUBJECT = "Action requise: migre tes blocs Ask Assistant";

const SEND_EMAILS = process.env.SEND_EMAILS === "true";
const CSV_PATH = process.env.CAMPAIGN_CSV_PATH ?? DEFAULT_CSV_PATH;
const CONCURRENCY = getPositiveIntegerEnv("CONCURRENCY", 5);
const MAX_RETRIES = getPositiveIntegerEnv("MAX_RETRIES", 3);
const PREVIEW_LIMIT = getPositiveIntegerEnv("PREVIEW_LIMIT", 3);
const SEND_LIMIT = getOptionalPositiveIntegerEnv("SEND_LIMIT");

const campaignCsvRowSchema = z.object({
  email: z.string().email(),
  names: z.string().optional().default(""),
  preferredLanguages: z.string().optional().default(""),
  roles: z.string().optional().default(""),
  workspaceNames: z.string().optional().default(""),
  affectedTypebotIds: z.string().min(1),
  affectedTypebotNames: z.string().optional().default(""),
  totalWarningEvents: z.coerce.number().int().nonnegative().default(0),
  lastWarningSeenAt: z.string().optional().default(""),
});

type CampaignRecipient = z.output<typeof campaignCsvRowSchema>;

export async function sendEmailCampaign() {
  const recipients = await parseCsv(CSV_PATH);
  const recipientsToProcess =
    SEND_LIMIT === undefined ? recipients : recipients.slice(0, SEND_LIMIT);

  console.log(
    `Prepared ${recipients.length} campaign recipient(s) from ${CSV_PATH}.`,
  );
  console.log(
    SEND_EMAILS
      ? `Sending ${recipientsToProcess.length} email(s) with concurrency ${CONCURRENCY}.`
      : `DRY RUN. Set SEND_EMAILS=true to send. Previewing ${Math.min(
          PREVIEW_LIMIT,
          recipientsToProcess.length,
        )} email(s).`,
  );

  if (!SEND_EMAILS) {
    for (const recipient of recipientsToProcess.slice(0, PREVIEW_LIMIT))
      console.log(formatPreview(recipient));
    return;
  }

  const limit = pLimit(CONCURRENCY);
  let processed = 0;

  const tasks = recipientsToProcess.map((recipient) =>
    limit(async () => {
      processed += 1;
      const email = makeEmail(recipient);

      console.log(
        `[${processed}/${recipientsToProcess.length}] Sending to ${recipient.email} about ${splitList(recipient.affectedTypebotIds).length} bot(s).`,
      );

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
        try {
          await sendEmail(email);
          return;
        } catch (error) {
          const delay = 250 * 2 ** (attempt - 1);
          console.warn(
            `[${recipient.email}] sendEmail failed (attempt ${attempt}/${MAX_RETRIES}): ${getErrorMessage(error)}`,
          );
          if (attempt === MAX_RETRIES) throw error;
          await sleep(delay);
        }
      }
    }),
  );

  await Promise.all(tasks);
  console.log("Done.");
}

async function parseCsv(filePath: string) {
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = Papa.parse<CampaignRecipient>(raw, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    const preview = parsed.errors
      .slice(0, 3)
      .map((error) => `${error.type}: ${error.message} @ row ${error.row}`)
      .join(" | ");
    console.warn(
      `[CSV] Encountered ${parsed.errors.length} parse error(s). First: ${preview}`,
    );
  }

  const recipientsByEmail = new Map<string, CampaignRecipient>();

  for (const row of parsed.data) {
    const safe = campaignCsvRowSchema.safeParse(row);
    if (!safe.success) {
      console.warn("[CSV] Skipping invalid row:", {
        row,
        errors: safe.error.flatten().fieldErrors,
      });
      continue;
    }
    recipientsByEmail.set(safe.data.email.toLowerCase(), safe.data);
  }

  return [...recipientsByEmail.values()].sort(
    (left, right) => right.totalWarningEvents - left.totalWarningEvents,
  );
}

function makeEmail(recipient: CampaignRecipient) {
  const isFrenchRecipient = isFrench(recipient);
  return {
    to: recipient.email,
    subject: isFrenchRecipient ? FRENCH_SUBJECT : ENGLISH_SUBJECT,
    text: isFrenchRecipient
      ? makeFrenchBody(recipient)
      : makeEnglishBody(recipient),
  };
}

function makeEnglishBody(recipient: CampaignRecipient) {
  const firstName = getFirstName(recipient.names);
  const greeting = firstName ? `Hi ${firstName},` : "Hi,";
  const workspaceLine = formatWorkspaceLine(recipient, "Affected workspace");
  const migratedLine = recipient.lastWarningSeenAt
    ? `\nIf you already migrated these bots after ${formatDate(
        recipient.lastWarningSeenAt,
        "en-US",
      )}, you can ignore this email.\n`
    : "";

  return `${greeting}

You're receiving this because one or more bots you can access still use the old Ask Assistant action.

OpenAI is retiring the Assistants API. In Typebot, Ask Assistant will stop working in August 2026.

${workspaceLine}

Affected bots:
${formatAffectedBots(recipient)}

What to do:
1. Open each bot.
2. Replace Ask Assistant with Ask Model.
3. Configure the model, instructions and tools directly in the new block.
4. Test the flow, then publish.

Migration notes:
${MIGRATION_DOC_URL}
${migratedLine}
Baptiste`;
}

function makeFrenchBody(recipient: CampaignRecipient) {
  const firstName = getFirstName(recipient.names);
  const greeting = firstName ? `Salut ${firstName},` : "Salut,";
  const workspaceLine = formatWorkspaceLine(recipient, "Workspace concerné");
  const migratedLine = recipient.lastWarningSeenAt
    ? `\nSi tu as déjà migré ces bots après le ${formatDate(
        recipient.lastWarningSeenAt,
        "fr-FR",
      )}, tu peux ignorer cet email.\n`
    : "";

  return `${greeting}

Tu reçois cet email parce qu'un ou plusieurs bots auxquels tu as accès utilisent encore l'ancienne action Ask Assistant.

OpenAI retire l'API Assistants. Dans Typebot, Ask Assistant arrêtera de fonctionner en août 2026.

${workspaceLine}

Bots concernés:
${formatAffectedBots(recipient)}

À faire:
1. Ouvre chaque bot.
2. Remplace Ask Assistant par Ask Model.
3. Configure le modèle, les instructions et les tools directement dans le nouveau bloc.
4. Teste le flow, puis publie.

Notes de migration:
${MIGRATION_DOC_URL}
${migratedLine}
Baptiste`;
}

function formatPreview(recipient: CampaignRecipient) {
  const email = makeEmail(recipient);
  return [
    "-----",
    `To: ${email.to}`,
    `Subject: ${email.subject}`,
    "",
    email.text,
    "-----",
  ].join("\n");
}

function formatWorkspaceLine(
  recipient: CampaignRecipient,
  singularLabel: string,
) {
  const workspaceNames = splitList(recipient.workspaceNames);
  if (workspaceNames.length === 0) return `${singularLabel}: your workspace`;
  if (workspaceNames.length === 1)
    return `${singularLabel}: ${workspaceNames[0]}`;
  return `${singularLabel}s: ${workspaceNames.join(", ")}`;
}

function formatAffectedBots(recipient: CampaignRecipient) {
  const typebotIds = splitList(recipient.affectedTypebotIds);
  const typebotNames = splitList(recipient.affectedTypebotNames);
  if (typebotIds.length === 0) return "- Affected bot in your workspace";

  return typebotIds
    .map((typebotId, index) => {
      const typebotName = typebotNames[index] ?? typebotId;
      return `- ${typebotName}: https://app.typebot.com/typebots/${typebotId}/edit`;
    })
    .join("\n");
}

function splitList(value: string) {
  return value
    .split(" | ")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function getFirstName(names: string) {
  const firstFullName = splitList(names)[0];
  if (!firstFullName) return;
  return firstFullName.split(" ")[0]?.trim();
}

function isFrench(recipient: CampaignRecipient) {
  return splitList(recipient.preferredLanguages).some((language) =>
    language.toLowerCase().startsWith("fr"),
  );
}

function formatDate(value: string, locale: "en-US" | "fr-FR") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

function getPositiveIntegerEnv(name: string, fallback: number) {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1)
    throw new Error(`${name} must be a positive integer.`);
  return parsed;
}

function getOptionalPositiveIntegerEnv(name: string) {
  const value = process.env[name];
  if (!value) return;
  return getPositiveIntegerEnv(name, 1);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

if (import.meta.url === `file://${process.argv[1]}`)
  sendEmailCampaign().catch((error) => {
    console.error("Campaign failed:", error);
    process.exitCode = 1;
  });
