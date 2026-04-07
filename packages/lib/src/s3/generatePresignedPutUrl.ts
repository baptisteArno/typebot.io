import { env } from "@typebot.io/env";
import { initClient } from "./initClient";

type Props = {
  filePath: string;
  fileType?: string;
};

const tenMinutes = 10 * 60;

export const generatePresignedPutUrl = async ({
  filePath,
  fileType,
}: Props) => {
  const minioClient = initClient();

  const presignedUrl = await minioClient.presignedPutObject(
    env.S3_BUCKET,
    filePath,
    tenMinutes,
  );

  return {
    presignedUrl,
    fileUrl: env.S3_PUBLIC_CUSTOM_DOMAIN
      ? `${env.S3_PUBLIC_CUSTOM_DOMAIN}/${filePath}`
      : `${presignedUrl.split("?")[0]}`,
    fileType,
  };
};
