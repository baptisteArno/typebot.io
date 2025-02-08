import { env } from "@typebot.io/env";

export const parseS3PublicBaseUrl = () =>
  env.S3_PUBLIC_CUSTOM_DOMAIN
    ? env.S3_PUBLIC_CUSTOM_DOMAIN
    : `http${env.S3_SSL ? "s" : ""}://${env.S3_ENDPOINT}${
        env.S3_PORT ? `:${env.S3_PORT}` : ""
      }/${env.S3_BUCKET}`;
