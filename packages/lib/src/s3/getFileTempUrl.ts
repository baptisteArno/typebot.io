import { env } from "@typebot.io/env";
import { initClient } from "./initClient";

type Props = {
  key: string;
  expires?: number;
};
export const getFileTempUrl = async ({
  key,
  expires,
}: Props): Promise<string> => {
  const minioClient = initClient();
  return minioClient.presignedGetObject(env.S3_BUCKET, key, expires ?? 3600);
};
