import { publicProcedure } from "@typebot.io/config/orpc/viewer/middlewares";
import { z } from "@typebot.io/zod";
import {
  generateUploadUrlV1InputSchema,
  handleGenerateUploadUrlV1,
} from "./deprecated/handleGenerateUploadUrlV1";
import {
  generateUploadUrlV2InputSchema,
  handleGenerateUploadUrlV2,
} from "./deprecated/handleGenerateUploadUrlV2";
import {
  getUploadUrlInputSchema,
  handleGetUploadUrl,
} from "./deprecated/handleGetUploadUrl";
import {
  generateUploadUrlInputSchema,
  handleGenerateUploadUrl,
} from "./handleGenerateUploadUrl";

export const publicRouter = {
  generateUploadUrlProcedure: publicProcedure
    .route({
      method: "POST",
      path: "/v3/generate-upload-url",
      summary: "Generate upload URL",
      description: "Used to upload anything from the client to S3 bucket",
      tags: ["File upload"],
    })
    .input(generateUploadUrlInputSchema)
    .output(
      z.object({
        presignedUrl: z.string(),
        formData: z.record(z.string(), z.any()),
        fileUrl: z.string(),
      }),
    )
    .handler(handleGenerateUploadUrl),
};

export const privateRouter = {
  generateUploadUrlV1Procedure: publicProcedure
    .route({
      method: "POST",
      path: "/v1/generate-upload-url",
      summary: "Generate upload URL",
      description: "Used to upload anything from the client to S3 bucket",
      deprecated: true,
      tags: ["File upload"],
    })
    .input(generateUploadUrlV1InputSchema)
    .output(
      z.object({
        presignedUrl: z.string(),
        formData: z.record(z.string(), z.any()),
        fileUrl: z.string(),
      }),
    )
    .handler(handleGenerateUploadUrlV1),
  generateUploadUrlV2Procedure: publicProcedure
    .route({
      method: "POST",
      path: "/v2/generate-upload-url",
      summary: "Generate upload URL",
      description: "Used to upload anything from the client to S3 bucket",
      deprecated: true,
      tags: ["File upload"],
    })
    .input(generateUploadUrlV2InputSchema)
    .output(
      z.object({
        presignedUrl: z.string(),
        formData: z.record(z.string(), z.any()),
        fileUrl: z.string(),
      }),
    )
    .handler(handleGenerateUploadUrlV2),
  getUploadUrlProcedure: publicProcedure
    .route({
      method: "GET",
      path: "/v1/typebots/{typebotId}/blocks/{blockId}/storage/upload-url",
      summary: "Get upload URL for a file",
      description: "Used for the web client to get the bucket upload file.",
      deprecated: true,
      tags: ["File upload"],
    })
    .input(getUploadUrlInputSchema)
    .output(
      z.object({
        presignedUrl: z.string(),
        hasReachedStorageLimit: z.boolean(),
      }),
    )
    .handler(handleGetUploadUrl),
};
