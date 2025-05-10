import { env } from "@typebot.io/env";
import { CopyConditions } from "minio";
import { initClient } from "./initClient";

export const copyObjects = async (
  filesToCopy: { oldName: string; newName: string }[],
) => {
  const minioClient = initClient();

  const conds = new CopyConditions();
  return Promise.all(
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
