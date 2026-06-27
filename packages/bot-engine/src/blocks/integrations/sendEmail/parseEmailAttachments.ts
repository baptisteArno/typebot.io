import { env } from "@typebot.io/env";
import { getFileTempUrl } from "@typebot.io/lib/s3/getFileTempUrl";
import { parseS3PublicBaseUrl } from "@typebot.io/lib/s3/parseS3PublicBaseUrl";
import type Mail from "nodemailer/lib/mailer/index";
import { getTypebotWorkspaceId } from "../../../queries/getTypebotWorkspaceId";

type ParseEmailAttachmentsDependencies = {
  getFileTempUrl: typeof getFileTempUrl;
  getTypebotWorkspaceId: typeof getTypebotWorkspaceId;
};

const defaultDependencies = {
  getFileTempUrl,
  getTypebotWorkspaceId,
};

const invalidAttachmentUrlErrorMessage = "Invalid email attachment URL";

export const parseEmailAttachments = async ({
  fileUrls,
  typebotId,
  dependencies = defaultDependencies,
}: {
  fileUrls: string | string[] | undefined;
  typebotId: string;
  dependencies?: ParseEmailAttachmentsDependencies;
}): Promise<Mail.Attachment[] | undefined> => {
  const urls = parseAttachmentUrls(fileUrls);
  if (urls.length === 0) return;

  return Promise.all(
    urls.map((url) => parseEmailAttachment({ url, typebotId, dependencies })),
  );
};

const parseEmailAttachment = async ({
  url,
  typebotId,
  dependencies,
}: {
  url: string;
  typebotId: string;
  dependencies: ParseEmailAttachmentsDependencies;
}): Promise<Mail.Attachment> => {
  const parsedUrl = parseHttpUrl(url);
  const privateUpload = parsePrivateTypebotUploadUrl({
    url: parsedUrl,
    typebotId,
  });

  if (privateUpload) {
    const workspaceId = await dependencies.getTypebotWorkspaceId(typebotId);
    if (!workspaceId) throw new Error(invalidAttachmentUrlErrorMessage);

    return {
      path: await dependencies.getFileTempUrl({
        key: `private/workspaces/${workspaceId}/typebots/${typebotId}/results/${privateUpload.resultId}/${privateUpload.blockId ? `blocks/${privateUpload.blockId}/` : ""}${privateUpload.fileName}`,
        expires: 600,
      }),
    };
  }

  if (isPublicTypebotUploadUrl({ url: parsedUrl, typebotId }))
    return { path: parsedUrl.href };

  throw new Error(invalidAttachmentUrlErrorMessage);
};

const parseAttachmentUrls = (
  fileUrls: string | string[] | undefined,
): string[] => {
  if (!fileUrls) return [];
  const urls = Array.isArray(fileUrls) ? fileUrls : fileUrls.split(", ");
  return urls.map((url) => url.trim()).filter((url) => url.length > 0);
};

const parseHttpUrl = (url: string): URL => {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:")
      throw new Error(invalidAttachmentUrlErrorMessage);
    return parsedUrl;
  } catch {
    throw new Error(invalidAttachmentUrlErrorMessage);
  }
};

const parsePrivateTypebotUploadUrl = ({
  url,
  typebotId,
}: {
  url: URL;
  typebotId: string;
}): { resultId: string; blockId?: string; fileName: string } | undefined => {
  if (url.origin !== new URL(env.NEXTAUTH_URL).origin) return;

  const segments = getPathSegments(url);
  const [api, typebots, urlTypebotId, results, resultId, nextSegment] =
    segments;

  if (
    api !== "api" ||
    typebots !== "typebots" ||
    urlTypebotId !== typebotId ||
    results !== "results" ||
    !resultId ||
    !nextSegment
  )
    return;

  if (segments.length === 6) {
    if (!areUploadPathSegmentsValid([urlTypebotId, resultId, nextSegment]))
      throw new Error(invalidAttachmentUrlErrorMessage);

    return {
      resultId,
      fileName: nextSegment,
    };
  }

  const [, , , , , blocks, blockId, fileName] = segments;

  if (segments.length !== 8 || blocks !== "blocks" || !blockId || !fileName)
    return;

  if (!areUploadPathSegmentsValid([urlTypebotId, resultId, blockId, fileName]))
    throw new Error(invalidAttachmentUrlErrorMessage);

  return {
    resultId,
    blockId,
    fileName,
  };
};

const isPublicTypebotUploadUrl = ({
  url,
  typebotId,
}: {
  url: URL;
  typebotId: string;
}): boolean => {
  const publicBaseUrl = parsePublicBaseUrl();
  if (!publicBaseUrl || url.origin !== publicBaseUrl.origin) return false;

  const publicBasePathSegments = getPathSegments(publicBaseUrl);
  const urlPathSegments = getPathSegments(url);
  if (!startsWithSegments(urlPathSegments, publicBasePathSegments))
    return false;

  const uploadSegments = urlPathSegments.slice(publicBasePathSegments.length);
  const [
    visibility,
    workspaces,
    workspaceId,
    typebots,
    urlTypebotId,
    results,
    resultId,
    nextSegment,
  ] = uploadSegments;

  if (
    visibility !== "public" ||
    workspaces !== "workspaces" ||
    !workspaceId ||
    typebots !== "typebots" ||
    urlTypebotId !== typebotId ||
    results !== "results" ||
    !resultId ||
    !nextSegment
  )
    return false;

  if (uploadSegments.length === 8)
    return areUploadPathSegmentsValid([
      workspaceId,
      urlTypebotId,
      resultId,
      nextSegment,
    ]);

  const [, , , , , , , blocks, blockId, fileName] = uploadSegments;

  return (
    uploadSegments.length === 10 &&
    blocks === "blocks" &&
    !!blockId &&
    !!fileName &&
    areUploadPathSegmentsValid([
      workspaceId,
      urlTypebotId,
      resultId,
      blockId,
      fileName,
    ])
  );
};

const parsePublicBaseUrl = (): URL | undefined => {
  try {
    return new URL(parseS3PublicBaseUrl());
  } catch {
    return;
  }
};

const getPathSegments = (url: URL): string[] =>
  url.pathname.split("/").filter((segment) => segment.length > 0);

const startsWithSegments = (
  segments: string[],
  expectedPrefix: string[],
): boolean =>
  expectedPrefix.every((segment, index) => segments[index] === segment);

const areUploadPathSegmentsValid = (segments: string[]): boolean =>
  segments.every(
    (segment) =>
      /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(segment) &&
      segment !== "." &&
      segment !== "..",
  );
