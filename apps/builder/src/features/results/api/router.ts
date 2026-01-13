import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { logSchema } from "@typebot.io/logs/schemas";
import { resultWithAnswersSchema } from "@typebot.io/results/schemas/results";
import { z } from "@typebot.io/zod";
import {
  deleteResultsInputSchema,
  handleDeleteResults,
} from "./handleDeleteResults";
import { getResultInputSchema, handleGetResult } from "./handleGetResult";
import {
  getResultBlockFileInputSchema,
  handleGetResultBlockFile,
} from "./handleGetResultBlockFile";
import {
  getResultFileInputSchema,
  handleGetResultFile,
} from "./handleGetResultFile";
import {
  getResultLogsInputSchema,
  handleGetResultLogs,
} from "./handleGetResultLogs";
import { getResultsInputSchema, handleGetResults } from "./handleGetResults";
import {
  getResultTranscriptInputSchema,
  handleGetResultTranscript,
} from "./handleGetResultTranscript";
import { handleTriggerCancelExport } from "./handleTriggerCancelExport";
import {
  handleTriggerExportJob,
  triggerExportJobInputSchema,
} from "./handleTriggerExportJob";
import { handleTriggerSendExportResultsToEmail } from "./handleTriggerSendExportResultsToEmail";

export const resultsRouter = {
  getResults: authenticatedProcedure
    .route({
      method: "GET",
      path: "/v1/typebots/{typebotId}/results",
      summary: "List results ordered by descending creation date",
      tags: ["Results"],
    })
    .input(getResultsInputSchema)
    .output(
      z.object({
        results: z.array(resultWithAnswersSchema),
        nextCursor: z.number().nullish(),
      }),
    )
    .handler(handleGetResults),

  getResult: authenticatedProcedure
    .route({
      method: "GET",
      path: "/v1/typebots/{typebotId}/results/{resultId}",
      summary: "Get result by id",
      tags: ["Results"],
    })
    .input(getResultInputSchema)
    .output(
      z.object({
        result: resultWithAnswersSchema,
      }),
    )
    .handler(handleGetResult),

  getResultTranscript: authenticatedProcedure
    .route({
      method: "GET",
      path: "/v1/typebots/{typebotId}/results/{resultId}/transcript",
      summary: "Get result transcript",
      tags: ["Results"],
    })
    .input(getResultTranscriptInputSchema)
    .output(
      z.object({
        transcript: z.array(
          z.object({
            role: z.enum(["bot", "user"]),
            type: z.enum(["text", "image", "video", "audio"]),
            text: z.string().optional(),
            image: z.string().optional(),
            video: z.string().optional(),
            audio: z.string().optional(),
          }),
        ),
      }),
    )
    .handler(handleGetResultTranscript),

  getResultLogs: authenticatedProcedure
    .route({
      method: "GET",
      path: "/v1/typebots/{typebotId}/results/{resultId}/logs",
      summary: "List result logs",
      tags: ["Results"],
    })
    .input(getResultLogsInputSchema)
    .output(z.object({ logs: z.array(logSchema) }))
    .handler(handleGetResultLogs),

  deleteResults: authenticatedProcedure
    .route({
      method: "DELETE",
      path: "/v1/typebots/{typebotId}/results",
      summary: "Delete results",
      tags: ["Results"],
    })
    .input(deleteResultsInputSchema)
    .output(z.void())
    .handler(handleDeleteResults),
  getResultFile: authenticatedProcedure
    .route({
      method: "GET",
      path: "/typebots/{typebotId}/results/{resultId}/{fileName}",
      successStatus: 302,
      outputStructure: "detailed",
      deprecated: true,
    })
    .input(getResultFileInputSchema)
    .output(
      z.object({
        headers: z.object({
          location: z.string(),
        }),
      }),
    )
    .handler(handleGetResultFile),

  getResultBlockFile: authenticatedProcedure
    .route({
      method: "GET",
      path: "/typebots/{typebotId}/results/{resultId}/blocks/{blockId}/{fileName}",
      successStatus: 302,
      outputStructure: "detailed",
    })
    .input(getResultBlockFileInputSchema)
    .output(
      z.object({
        headers: z.object({
          location: z.string(),
        }),
      }),
    )
    .handler(handleGetResultBlockFile),

  triggerExportJob: authenticatedProcedure
    .input(triggerExportJobInputSchema)
    .output(
      z.discriminatedUnion("status", [
        z.object({
          status: z.literal("success"),
          eventId: z.string(),
          token: z.any(),
        }),
        z.object({
          status: z.literal("disabled"),
        }),
      ]),
    )
    .handler(handleTriggerExportJob),

  triggerSendExportResultsToEmail: authenticatedProcedure
    .output(
      z.object({
        eventId: z.string(),
      }),
    )
    .handler(handleTriggerSendExportResultsToEmail),

  triggerCancelExport: authenticatedProcedure.handler(
    handleTriggerCancelExport,
  ),
};
