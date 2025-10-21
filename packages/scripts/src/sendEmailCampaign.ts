import fs from "node:fs/promises";
import { setTimeout as sleep } from "node:timers/promises";
import { sendEmail } from "@typebot.io/emails/helpers/sendEmail";
import { isDefined } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma/withReadReplica";
import pLimit from "p-limit";
import Papa from "papaparse";
import { z } from "zod";

type CsvRow = { typebotId: string; total?: string };

const CSV_SCHEMA = z.object({
  typebotId: z.string().min(1),
  total: z.string().optional(),
});

const SUBJECT =
  "Action needed: some of your bots need republishing before Nov 20";
const DEADLINE = "November 20, 2025";
const makeBody = (
  workspaceName: string,
  urls: string[],
) => `You are receiving this email because you are an admin of the Typebot workspace "${workspaceName}".

We’re retiring an old Typebot endpoint on ${DEADLINE}. Here are the bots that need to be republished:

${urls.join("\n")}

All you need to do is:

1️⃣ Open the bots in the editor — it will automatically migrate them to the new version  
2️⃣ Run a quick test to make sure everything is working  
3️⃣ Click Publish

That’s it, in most cases nothing to change on your end.

Please republish before ${DEADLINE} to make sure your bots keep running smoothly.

Thanks for keeping your bots up to date! 🧡`;

const DRY_RUN = process.env.DRY_RUN === "1";
const CONCURRENCY = Number(process.env.CONCURRENCY ?? 5); // email send concurrency
const MAX_RETRIES = 3;

async function parseCsv(filePath: string): Promise<string[]> {
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = Papa.parse<CsvRow>(raw, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length) {
    const preview = parsed.errors
      .slice(0, 3)
      .map((e) => `${e.type}: ${e.message} @ row ${e.row}`)
      .join(" | ");
    console.warn(
      `[CSV] Encountered ${parsed.errors.length} parse errors. First: ${preview}`,
    );
  }

  const ids = new Set<string>();
  for (const row of parsed.data) {
    const safe = CSV_SCHEMA.safeParse(row);
    if (!safe.success) {
      console.warn(
        "[CSV] Skipping invalid row:",
        row,
        safe.error.flatten().fieldErrors,
      );
      continue;
    }
    ids.add(safe.data.typebotId.trim());
  }
  return Array.from(ids);
}

async function main() {
  const typebotIds = await parseCsv("./inputs/typebotIds.csv");
  if (typebotIds.length === 0) {
    console.log("No valid typebot IDs found in CSV. Exiting.");
    return;
  }
  console.log(`Found ${typebotIds.length} unique typebot IDs.`);

  const typebots = await prisma.typebot.findMany({
    where: { id: { in: typebotIds } },
    select: { id: true, workspaceId: true },
  });

  if (typebots.length === 0) {
    throw new Error("None of the provided typebot IDs exist.");
  }

  const typebotsByWorkspace = new Map<string, string[]>();
  for (const tb of typebots) {
    if (!tb.workspaceId) continue;
    const arr = typebotsByWorkspace.get(tb.workspaceId) ?? [];
    arr.push(tb.id);
    typebotsByWorkspace.set(tb.workspaceId, arr);
  }

  const workspaceIds = Array.from(typebotsByWorkspace.keys());
  const workspaces = await prisma.workspace.findMany({
    where: { id: { in: workspaceIds } },
    select: {
      id: true,
      name: true,
      members: {
        where: { role: { not: "GUEST" } },
        select: { user: { select: { email: true } } },
      },
    },
  });

  const wsMap = new Map(workspaces.map((w) => [w.id, w]));

  const limit = pLimit(CONCURRENCY);
  let processed = 0;

  const tasks = workspaceIds.map((workspaceId) =>
    limit(async () => {
      processed += 1;
      const ws = wsMap.get(workspaceId);
      const tbIds = typebotsByWorkspace.get(workspaceId) ?? [];

      if (!ws) {
        console.warn(
          `[WS ${workspaceId}] Workspace not found. Skipping ${tbIds.length} bots.`,
        );
        return;
      }

      const recipients = ws.members
        .map((m) => m.user?.email?.trim())
        .filter(isDefined)
        .filter((e) => e.length > 3) as string[];

      if (recipients.length === 0) {
        console.warn(`[WS ${workspaceId}] No valid member emails. Skipping.`);
        return;
      }

      const typebotUrls = tbIds.map(
        (id) => `https://app.typebot.io/typebots/${id}/edit`,
      );
      const text = makeBody(ws.name, typebotUrls);

      console.log(
        `[${processed}/${workspaceIds.length}] ${workspaceId}: sending to ${recipients.length} member(s) about ${tbIds.length} bot(s).${DRY_RUN ? " [DRY RUN]" : ""}`,
      );

      if (DRY_RUN) {
        console.log({
          to: recipients,
          subject: SUBJECT,
          previewFirstUrl: typebotUrls[0],
        });
        return;
      }

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          await sendEmail({ to: recipients, subject: SUBJECT, text });
          break; // success
        } catch (err) {
          const delay = 250 * 2 ** (attempt - 1);
          const msg = (err as Error)?.message ?? String(err);
          console.warn(
            `[WS ${workspaceId}] sendEmail failed (attempt ${attempt}/${MAX_RETRIES}): ${msg}`,
          );
          if (attempt === MAX_RETRIES) throw err;
          await sleep(delay);
        }
      }
    }),
  );

  try {
    await Promise.all(tasks);
    console.log("✅ Done.");
  } catch (err) {
    console.error("❌ Aborted due to error:", err);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exitCode = 1;
});
