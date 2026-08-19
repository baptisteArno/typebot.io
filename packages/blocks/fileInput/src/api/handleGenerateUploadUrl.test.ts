import { beforeEach, describe, expect, it, mock } from "bun:test";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";

process.env.DATABASE_URL = "postgres://user:password@localhost:5432/typebot";
process.env.ENCRYPTION_SECRET = "12345678901234567890123456789012";
process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.NEXT_PUBLIC_VIEWER_URL = "http://localhost:3001";
process.env.S3_ACCESS_KEY = "minio";
process.env.S3_BUCKET = "typebot";
process.env.S3_ENDPOINT = "s3.example.com";
process.env.S3_SECRET_KEY = "miniostorage";
process.env.SKIP_ENV_CHECK = "false";

const getSessionMock = mock();
const publicTypebotFindFirstMock = mock();

mock.module("@typebot.io/chat-session/queries/getSession", () => ({
  getSession: getSessionMock,
}));

mock.module("@typebot.io/prisma", () => ({
  default: {
    publicTypebot: {
      findFirst: publicTypebotFindFirstMock,
    },
  },
}));

const { handleGenerateUploadUrl } = await import("./handleGenerateUploadUrl");

const blockIdFromSession = "block-session";
const resultIdFromSession = "result-session";
const sessionId = "session-id";
const typebotIdFromSession = "typebot-session";
const workspaceIdFromPublicTypebot = "workspace-session";

describe("handleGenerateUploadUrl", () => {
  beforeEach(() => {
    getSessionMock.mockReset();
    publicTypebotFindFirstMock.mockReset();
    getSessionMock.mockResolvedValue(buildSession());
    publicTypebotFindFirstMock.mockResolvedValue(buildPublicTypebot());
  });

  it("uses the session block for current uploads", async () => {
    const response = await handleGenerateUploadUrl({
      input: {
        sessionId,
        blockId: "block-request",
        fileName: "file.png",
        fileType: "image/png",
        fileSize: 1024,
      },
      context: { apiOrigin: "http://localhost:3001" },
    });

    const filePath = parseSignedUploadFilePath(response.presignedUrl);

    expect(filePath.startsWith(expectedCurrentResultPrefix())).toBe(true);
    expect(filePath.includes("block-request")).toBe(false);
    expect(filePath.endsWith(".png")).toBe(true);
    expect(response.fileUrl.startsWith(expectedCurrentPrivateFileUrl())).toBe(
      true,
    );
    expect(response.maxFileSize).toBe(5);
  });

  it("keeps enforcing an extension-based image allowlist for captured files", async () => {
    publicTypebotFindFirstMock.mockResolvedValue(
      buildPublicTypebot([".JPG", ".png", ".jpeg"]),
    );

    const response = await handleGenerateUploadUrl({
      input: {
        sessionId,
        blockId: blockIdFromSession,
        fileName: "captured-image.jpg",
        fileType: "image/jpeg",
      },
      context: { apiOrigin: "http://localhost:3001" },
    });

    expect(
      parseSignedUploadFilePath(response.presignedUrl).endsWith(".jpeg"),
    ).toBe(true);
    await expect(
      handleGenerateUploadUrl({
        input: {
          sessionId,
          blockId: blockIdFromSession,
          fileName: "document.pdf",
          fileType: "application/pdf",
        },
        context: { apiOrigin: "http://localhost:3001" },
      }),
    ).rejects.toThrow("File type application/pdf not allowed");
  });

  it("fails closed when an enabled allowlist cannot be resolved", async () => {
    publicTypebotFindFirstMock.mockResolvedValue(
      buildPublicTypebot(["image/x-unknown"]),
    );

    await expect(
      handleGenerateUploadUrl({
        input: {
          sessionId,
          blockId: blockIdFromSession,
          fileName: "document.pdf",
          fileType: "application/pdf",
        },
        context: { apiOrigin: "http://localhost:3001" },
      }),
    ).rejects.toThrow("File type application/pdf not allowed");
  });
});

const buildSession = () => ({
  state: {
    currentBlockId: blockIdFromSession,
    typebotsQueue: [
      {
        resultId: resultIdFromSession,
        typebot: {
          id: typebotIdFromSession,
        },
      },
    ],
  },
});

const buildPublicTypebot = (allowedFileTypes?: string[]) => ({
  version: "5",
  groups: [
    {
      id: "group",
      title: "Group",
      graphCoordinates: { x: 0, y: 0 },
      blocks: [
        {
          id: blockIdFromSession,
          type: InputBlockType.FILE,
          options: {
            visibility: "Private",
            sizeLimit: 5,
            capture: allowedFileTypes ? "environment" : undefined,
            allowedFileTypes: allowedFileTypes
              ? { isEnabled: true, types: allowedFileTypes }
              : undefined,
          },
        },
      ],
    },
  ],
  typebot: {
    workspaceId: workspaceIdFromPublicTypebot,
  },
});

const parseSignedUploadFilePath = (presignedUrl: string) => {
  const token = new URL(presignedUrl).pathname.split("/").at(-1);
  if (!token) throw new Error("Missing upload token");

  const encodedPayload = decodeURIComponent(token).split(".")[0];
  if (!encodedPayload) throw new Error("Missing upload payload");

  const payload: unknown = JSON.parse(
    Buffer.from(encodedPayload, "base64url").toString("utf8"),
  );

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("filePath" in payload) ||
    typeof payload.filePath !== "string"
  )
    throw new Error("Invalid upload payload");

  return payload.filePath;
};

const expectedResultPrefix = () =>
  `private/workspaces/${workspaceIdFromPublicTypebot}/typebots/${typebotIdFromSession}/results/${resultIdFromSession}/`;

const expectedCurrentResultPrefix = () =>
  `${expectedResultPrefix()}blocks/${blockIdFromSession}/`;

const expectedPrivateFileUrl = () =>
  `${process.env.NEXTAUTH_URL}/api/typebots/${typebotIdFromSession}/results/${resultIdFromSession}/`;

const expectedCurrentPrivateFileUrl = () =>
  `${expectedPrivateFileUrl()}blocks/${blockIdFromSession}/`;
