import { env } from "@typebot.io/env";
import { isNotEmpty } from "../utils";

type S3Config = {
  S3_BUCKET?: string;
  S3_ENDPOINT?: string;
  S3_ACCESS_KEY?: string;
  S3_SECRET_KEY?: string;
};

export const hasS3Config = (config: S3Config) =>
  isNotEmpty(config.S3_BUCKET) &&
  isNotEmpty(config.S3_ENDPOINT) &&
  isNotEmpty(config.S3_ACCESS_KEY) &&
  isNotEmpty(config.S3_SECRET_KEY);

export const isS3Configured = () =>
  hasS3Config({
    S3_BUCKET: env.S3_BUCKET,
    S3_ENDPOINT: env.S3_ENDPOINT,
    S3_ACCESS_KEY: env.S3_ACCESS_KEY,
    S3_SECRET_KEY: env.S3_SECRET_KEY,
  });
