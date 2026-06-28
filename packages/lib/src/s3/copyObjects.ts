import { env } from "@typebot.io/env";
import { CopyConditions } from "minio";
import { initClient } from "./initClient";
import { isS3Configured } from "./isS3Configured";

export const copyObjects = async (
  filesToCopy: { oldName: string; newName: string }[],
): Promise<void> => {
  if (filesToCopy.length === 0 || !isS3Configured()) return;

  const minioClient = initClient();

  const conds = new CopyConditions();
  await Promise.all(
    filesToCopy.map((fileToCopy) =>
      minioClient.copyObject(
        env.S3_BUCKET,
        fileToCopy.newName,
        `${env.S3_BUCKET}/${fileToCopy.oldName}`,
        conds,
      ),
    ),
  );
};
