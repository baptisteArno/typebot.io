import { env } from "@typebot.io/env";
import { initClient } from "./initClient";

type Props = {
  key: string;
  file: Buffer;
  mimeType: string;
};

export const uploadFileToBucket = async ({
  key,
  file,
  mimeType,
}: Props): Promise<string> => {
  const minioClient = initClient();

  await minioClient.putObject(env.S3_BUCKET, "public/" + key, file, {
    "Content-Type": mimeType,
    "Cache-Control": "public, max-age=86400",
  });

  return env.S3_PUBLIC_CUSTOM_DOMAIN
    ? `${env.S3_PUBLIC_CUSTOM_DOMAIN}/public/${key}`
    : `http${env.S3_SSL ? "s" : ""}://${env.S3_ENDPOINT}${
        env.S3_PORT ? `:${env.S3_PORT}` : ""
      }/${env.S3_BUCKET}/public/${key}`;
};
