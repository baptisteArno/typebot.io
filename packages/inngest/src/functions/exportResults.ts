import { channel, topic } from "@inngest/realtime";
import { sendResultsExportLinkEmail } from "@typebot.io/emails/transactional/ResultsExportLinkEmail";
import { uploadFileToBucket } from "@typebot.io/lib/s3/uploadFileToBucket";
import prisma from "@typebot.io/prisma";
import { getExportFileName } from "@typebot.io/results/getExportFileName";
import { streamAllResultsToCsv } from "@typebot.io/results/streamAllResultsToCsv";
import { z } from "@typebot.io/zod";
import { mkdirSync, readFileSync, unlinkSync } from "fs";
import { NonRetriableError } from "inngest";
import path from "path";
import { inngest } from "../client";

const updateDataSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("started"),
  }),
  z.object({
    status: z.literal("processing"),
    progress: z.number(),
  }),
  z.object({
    status: z.literal("complete"),
    fileUrl: z.string(),
    fileName: z.string(),
  }),
]);

export type UpdateData = z.infer<typeof updateDataSchema>;

export const EXPORT_REQUESTED_EVENT_NAME = "builder/results.export.requested";
const EXPORT_COMPLETED_EVENT_NAME = "builder/results.export.completed";
export const EXPORT_REQUEST_CANCELLED_EVENT_NAME =
  "builder/results.export.cancelled";
export const SEND_EMAIL_REQUESTED_EVENT_NAME =
  "builder/send.export.to.email.requested";

export const exportResultsEventDataSchema = z.object({
  userId: z.string(),
  typebotId: z.string(),
});

const cancelEventConfig = {
  event: EXPORT_REQUEST_CANCELLED_EVENT_NAME,
  if: "async.data.userId == event.data.userId",
};

export const exportResults = inngest.createFunction(
  {
    id: "export-results",
    cancelOn: [cancelEventConfig],
  },
  { event: EXPORT_REQUESTED_EVENT_NAME },
  async ({ event, step, publish }) => {
    const { typebotId } = exportResultsEventDataSchema.parse(event.data);

    const typebot = await step.run("get-typebot", async () => {
      const typebot = await prisma.typebot.findUnique({
        where: {
          id: typebotId,
        },
        select: {
          id: true,
          name: true,
          publicId: true,
          groups: true,
          workspaceId: true,
        },
      });
      if (!typebot) throw new NonRetriableError("Typebot not found");
      return typebot;
    });

    await publish(
      userChannel(event.data.userId).jobStatus({
        status: "started",
      }),
    );

    const logsDir = path.join(process.cwd(), "logs");
    mkdirSync(logsDir, { recursive: true });

    const writeStreamPath = path.join(logsDir, `${typebotId}.csv`);

    await step.run("stream-results-to-csv", async () => {
      const result = await streamAllResultsToCsv(typebotId, {
        writeStreamPath,
        onProgressUpdate: async (progress) => {
          await publish(
            userChannel(event.data.userId).jobStatus({
              status: "processing",
              progress,
            }),
          );
        },
      });
      if (result.status === "error") {
        throw new NonRetriableError(result.message);
      }
    });

    const fileName = getExportFileName({
      id: typebotId,
      name: typebot.name,
      publicId: typebot.publicId,
    });

    const fileUrl = await step.run("upload-file", async () => {
      const file = await uploadFileToBucket({
        visibility: "private",
        key: `tmp/workspaces/${typebot.workspaceId}/typebots/${typebotId}/results-exports/${fileName}`,
        file: readFileSync(writeStreamPath),
        mimeType: "text/csv",
      });
      unlinkSync(writeStreamPath);
      return file;
    });

    await publish(
      userChannel(event.data.userId).jobStatus({
        status: "complete",
        fileUrl,
        fileName,
      }),
    );

    await step.sendEvent("emit-export-completed", {
      name: EXPORT_COMPLETED_EVENT_NAME,
      data: {
        userId: event.data.userId,
        typebotName: typebot.name,
        fileUrl,
      },
    });
  },
);

export const sendExportedResultsToEmail = inngest.createFunction(
  { id: "send-exported-results", cancelOn: [cancelEventConfig] },
  { event: SEND_EMAIL_REQUESTED_EVENT_NAME },
  async ({ step, event }) => {
    const completeEvent = await step.waitForEvent("wait-for-export-complete", {
      event: EXPORT_COMPLETED_EVENT_NAME,
      if: "event.data.userId == async.data.userId",
      timeout: "1h",
    });

    if (completeEvent) {
      await step.run("send-email", async () => {
        await sendResultsExportLinkEmail({
          email: event.data.email,
          typebotName: completeEvent.data.typebotName,
          fileUrl: completeEvent.data.fileUrl,
        });
      });
    }
  },
);

export const userChannel = channel(
  (userId: string) => `user:${userId}`,
).addTopic(topic("jobStatus").schema(updateDataSchema));
