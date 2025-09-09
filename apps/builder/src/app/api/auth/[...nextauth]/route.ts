import { env } from "@typebot.io/env";
import { mockedUser } from "@typebot.io/user/mockedUser";
import { type NextRequest, NextResponse } from "next/server";
import {
  authHandlers,
  SET_TYPEBOT_COOKIE_HEADER,
} from "@/features/auth/lib/nextAuth";

export const GET = async (req: NextRequest) => {
  const isMockingSession =
    req.url.endsWith("/api/auth/session") && env.NEXT_PUBLIC_E2E_TEST;
  if (isMockingSession) return NextResponse.json({ user: mockedUser });
  const response = await authHandlers.GET(req);
  setTypebotCookie(req, response);
  return response;
};

export const POST = async (req: NextRequest) => {
  const response = await authHandlers.POST(req);
  setTypebotCookie(req, response);
  return response;
};

// Accept company firewall requests? Not sure if it is still necessary
export const HEAD = () => {
  return NextResponse.json({ message: "ok" }, { status: 200 });
};

// Because we don't have access to `res` in nextAuth.ts
const setTypebotCookie = (req: NextRequest, response: Response) => {
  const typebotSetCookieHeaderValue = req.headers.get(
    SET_TYPEBOT_COOKIE_HEADER,
  );
  if (typebotSetCookieHeaderValue)
    response.headers.append("Set-Cookie", typebotSetCookieHeaderValue);
};
