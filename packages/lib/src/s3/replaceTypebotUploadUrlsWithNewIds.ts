import { env } from "@typebot.io/env";
import { initClient } from "./initClient";

export const replaceTypebotUploadUrlsWithNewIds = async <
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
}): Promise<{
  typebot: T;
  filesToCopy: { oldName: string; newName: string }[];
}> => {
  if (!typebot.id || !typebot.workspaceId || !env.S3_ENDPOINT)
    return {
      typebot,
      filesToCopy: [],
    };
  let stringifiedTypebot = JSON.stringify(typebot);
  const minioClient = initClient();

  const objectsStream = minioClient.listObjectsV2(
    env.S3_BUCKET,
    `public/workspaces/${typebot.workspaceId}/typebots/${typebot.id}/`,
  );

  const filesToCopy: { oldName: string; newName: string }[] = [];
  for await (const obj of objectsStream) {
    if (!obj) continue;
    if ("prefix" in obj) {
      if (obj.prefix.endsWith("blocks/")) {
        const blocksStream = minioClient.listObjectsV2(
          env.S3_BUCKET,
          obj.prefix,
          true,
        );
        for await (const blockObj of blocksStream) {
          if (!blockObj.name) continue;
          const newFileName = blockObj.name
            .replace(typebot.id, newTypebotId)
            .replace(typebot.workspaceId, newWorkspaceId);
          filesToCopy.push({
            oldName: blockObj.name,
            newName: newFileName,
          });
          stringifiedTypebot = stringifiedTypebot.replaceAll(
            blockObj.name,
            newFileName,
          );
        }
      } else {
      }
      continue;
    }
    if (!obj.name) continue;
    const newFileName = obj.name
      .replace(typebot.id, newTypebotId)
      .replace(typebot.workspaceId, newWorkspaceId);
    filesToCopy.push({
      oldName: obj.name,
      newName: newFileName,
    });
    stringifiedTypebot = stringifiedTypebot.replaceAll(obj.name, newFileName);
  }

  return {
    typebot: JSON.parse(stringifiedTypebot),
    filesToCopy,
  };
};
