import { createUploadProxyCorsHeaders } from "@typebot.io/lib/s3/createUploadProxyCorsHeaders";
import {
  SignedUploadProxyError,
  uploadFileFromSignedUploadProxyToken,
} from "@typebot.io/lib/s3/signedUploadProxy";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export const runtime = "nodejs";

export const OPTIONS = (request: Request) =>
  new Response(null, {
    status: 204,
    headers: createUploadProxyCorsHeaders(request),
  });

export const PUT = async (request: Request, context: RouteContext) =>
  handleUploadRequest(request, context);

const handleUploadRequest = async (request: Request, context: RouteContext) => {
  try {
    const { token } = await context.params;
    await uploadFileFromSignedUploadProxyToken({ token, request });

    return new Response(null, {
      status: 204,
      headers: createUploadProxyCorsHeaders(request),
    });
  } catch (error) {
    if (error instanceof SignedUploadProxyError)
      return new Response(error.message, {
        status: error.statusCode,
        headers: createUploadProxyCorsHeaders(request),
      });

    throw error;
  }
};
