import {
  authenticatedProcedure,
  publicProcedure as builderPublicProcedure,
} from "@typebot.io/config/orpc/builder/middlewares";
import { publicProcedure } from "@typebot.io/config/orpc/viewer/middlewares";
import { z } from "zod";
import {
  generateUploadUrlInputSchema,
  handleGenerateUploadUrl,
} from "./handleGenerateUploadUrl";
import {
  getPrivateFileInputSchema,
  handleGetPrivateFile,
} from "./handleGetPrivateFile";

export const fileUploadBuilderRouter = {
  getPrivateFile: authenticatedProcedure
    .route({
      method: "GET",
      path: "/s3/private/{+rest}",
      successStatus: 307,
      outputStructure: "detailed",
    })
    .output(
      z.object({
        headers: z.object({
          location: z.string(),
        }),
      }),
    )
    .input(getPrivateFileInputSchema)
    .handler(handleGetPrivateFile),
  generateUploadUrlProcedure: builderPublicProcedure
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
        formData: z.record(z.string(), z.string()),
        fileType: z.string().optional(),
        maxFileSize: z.number().optional(),
        fileUrl: z.string(),
      }),
    )
    .handler(handleGenerateUploadUrl),
};

export const fileUploadViewerRouter = {
  generateUploadUrlProcedure: publicProcedure
    .route({
      method: "POST",
      path: "/v3/generate-upload-url",
      operationId: "generateUploadUrl",
      summary: "Generate upload URL",
      description: "Used to upload anything from the client to S3 bucket",
      tags: ["File upload"],
    })
    .input(generateUploadUrlInputSchema)
    .output(
      z.object({
        presignedUrl: z.string(),
        formData: z.record(z.string(), z.string()),
        fileType: z.string().optional(),
        maxFileSize: z.number().optional(),
        fileUrl: z.string(),
      }),
    )
    .handler(handleGenerateUploadUrl),
};
