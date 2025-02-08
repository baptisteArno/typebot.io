import { env } from "@typebot.io/env";
import { CopyConditions } from "minio";
import { initClient } from "./initClient";

export const duplicateTypebotS3Objects = async <
  T extends Partial<{
    id: string;
    workspaceId: string;
  }>,
>({
  typebot,
  newTypebotId,
  newWorkspaceId,
}: {
  typebot: T;
  newTypebotId: string;
  newWorkspaceId: string;
}): Promise<T> => {
  if (!typebot.id || !typebot.workspaceId) return typebot;
  let stringifiedTypebot = JSON.stringify(typebot);
  const minioClient = initClient();

  const objectsStream = minioClient.listObjectsV2(
    env.S3_BUCKET,
    `public/workspaces/${typebot.workspaceId}/typebots/${typebot.id}/`,
    true,
  );

  const conds = new CopyConditions();
  for await (const obj of objectsStream) {
    await minioClient.copyObject(
      env.S3_BUCKET,
      obj.name
        .replace(typebot.id, newTypebotId)
        .replace(typebot.workspaceId, newWorkspaceId),
      `${env.S3_BUCKET}/${obj.name}`,
      conds,
    );
    stringifiedTypebot = stringifiedTypebot.replaceAll(
      obj.name,
      obj.name
        .replace(typebot.id, newTypebotId)
        .replace(typebot.workspaceId, newWorkspaceId),
    );
  }

  return JSON.parse(stringifiedTypebot);
};
