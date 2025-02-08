import { env } from "@typebot.io/env";
import { initClient } from "./initClient";
import { parseS3PublicBaseUrl } from "./parseS3PublicBaseUrl";

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

  return `${parseS3PublicBaseUrl()}/public/${key}`;
};
