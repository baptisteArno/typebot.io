import { env } from "@typebot.io/env";
import { initClient } from "./initClient";

const removeObjectsRecursively = async (prefix: string) => {
  const minioClient = initClient();

  const bucketName = env.S3_BUCKET;

  const objectsStream = minioClient.listObjectsV2(bucketName, prefix, true);

  for await (const obj of objectsStream) {
    try {
      await minioClient.removeObject(bucketName, obj.name);
    } catch (err) {
      console.error(`Error removing ${obj.name}:`, err);
    }
  }
};

export const removeObjectsFromWorkspace = async (workspaceId: string) => {
  await removeObjectsRecursively(`public/workspaces/${workspaceId}/`);
  await removeObjectsRecursively(`private/workspaces/${workspaceId}/`);
};

export const removeObjectsFromResult = async ({
  workspaceId,
  resultIds,
  typebotId,
}: {
  workspaceId: string;
  resultIds: string[];
  typebotId: string;
}) => {
  for (const resultId of resultIds) {
    await removeObjectsRecursively(
      `public/workspaces/${workspaceId}/typebots/${typebotId}/results/${resultId}/`,
    );
  }
};

export const removeAllObjectsFromResult = async ({
  workspaceId,
  typebotId,
}: {
  workspaceId: string;
  typebotId: string;
}) => {
  await removeObjectsRecursively(
    `public/workspaces/${workspaceId}/typebots/${typebotId}/results/`,
  );
};

export const removeObjectsFromTypebot = async ({
  typebotId,
  workspaceId,
}: {
  typebotId: string;
  workspaceId: string;
}) => {
  await removeObjectsRecursively(
    `public/workspaces/${workspaceId}/typebots/${typebotId}/`,
  );
};

export const removeObjectsFromUser = async (userId: string) => {
  await removeObjectsRecursively(`public/users/${userId}/`);
};
