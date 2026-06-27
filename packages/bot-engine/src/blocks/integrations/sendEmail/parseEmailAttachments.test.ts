import { describe, expect, it } from "bun:test";
import { env } from "@typebot.io/env";
import { parseS3PublicBaseUrl } from "@typebot.io/lib/s3/parseS3PublicBaseUrl";
import { parseEmailAttachments } from "./parseEmailAttachments";

const typebotId = "typebot-1";
const workspaceId = "workspace-1";
const resultId = "result-1";
const blockId = "block-1";
const fileName = "attachment.txt";
const invalidAttachmentUrlErrorMessage = "Invalid email attachment URL";

const createDependencies = () => {
  const getFileTempUrlCalls: { key: string; expires?: number }[] = [];

  return {
    dependencies: {
      getTypebotWorkspaceId: async () => workspaceId,
      getFileTempUrl: async ({
        key,
        expires,
      }: {
        key: string;
        expires?: number;
      }) => {
        getFileTempUrlCalls.push({ key, expires });
        return `https://typebot-storage.test/${key}`;
      },
    },
    getFileTempUrlCalls,
  };
};

describe("parseEmailAttachments", () => {
  it("rejects local attachment paths", async () => {
    await expect(
      parseEmailAttachments({
        fileUrls: "local-attachment.txt",
        typebotId,
        dependencies: createDependencies().dependencies,
      }),
    ).rejects.toThrow(invalidAttachmentUrlErrorMessage);
  });

  it("rejects untrusted attachment URLs without requesting them", async () => {
    let requestCount = 0;
    const server = Bun.serve({
      hostname: "localhost",
      port: 0,
      fetch: () => {
        requestCount += 1;
        return new Response("not a Typebot upload");
      },
    });

    try {
      await expect(
        parseEmailAttachments({
          fileUrls: `http://localhost:${server.port}/attachment.txt`,
          typebotId,
          dependencies: createDependencies().dependencies,
        }),
      ).rejects.toThrow(invalidAttachmentUrlErrorMessage);

      expect(requestCount).toBe(0);
    } finally {
      server.stop();
    }
  });

  it("accepts public Typebot upload attachments", async () => {
    const publicFileUrl = `${parseS3PublicBaseUrl()}/public/workspaces/${workspaceId}/typebots/${typebotId}/results/${resultId}/${fileName}`;

    await expect(
      parseEmailAttachments({
        fileUrls: publicFileUrl,
        typebotId,
        dependencies: createDependencies().dependencies,
      }),
    ).resolves.toEqual([{ path: publicFileUrl }]);
  });

  it("rejects public Typebot upload URLs from another typebot", async () => {
    const publicFileUrl = `${parseS3PublicBaseUrl()}/public/workspaces/${workspaceId}/typebots/other-typebot/results/${resultId}/${fileName}`;

    await expect(
      parseEmailAttachments({
        fileUrls: publicFileUrl,
        typebotId,
        dependencies: createDependencies().dependencies,
      }),
    ).rejects.toThrow(invalidAttachmentUrlErrorMessage);
  });

  it("resolves private Typebot upload attachments to temporary URLs", async () => {
    const { dependencies, getFileTempUrlCalls } = createDependencies();
    const legacyPrivateFileKey = `private/workspaces/${workspaceId}/typebots/${typebotId}/results/${resultId}/${fileName}`;
    const blockPrivateFileKey = `private/workspaces/${workspaceId}/typebots/${typebotId}/results/${resultId}/blocks/${blockId}/${fileName}`;

    const attachments = await parseEmailAttachments({
      fileUrls: [
        `${env.NEXTAUTH_URL}/api/typebots/${typebotId}/results/${resultId}/${fileName}`,
        `${env.NEXTAUTH_URL}/api/typebots/${typebotId}/results/${resultId}/blocks/${blockId}/${fileName}`,
      ],
      typebotId,
      dependencies,
    });

    expect(attachments).toEqual([
      { path: `https://typebot-storage.test/${legacyPrivateFileKey}` },
      { path: `https://typebot-storage.test/${blockPrivateFileKey}` },
    ]);

    expect(getFileTempUrlCalls).toEqual([
      { key: legacyPrivateFileKey, expires: 600 },
      { key: blockPrivateFileKey, expires: 600 },
    ]);
  });
});
