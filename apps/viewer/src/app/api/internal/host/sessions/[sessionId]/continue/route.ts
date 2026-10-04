import { continueHostChat } from "../../../bridge";

export const runtime = "nodejs";

export const POST = (
  request: Request,
  context: { params: Promise<{ sessionId: string }> },
) =>
  context.params.then(({ sessionId }) => continueHostChat(request, sessionId));
