import { authHandlers } from "@/features/auth/lib/nextAuth";
import { env } from "@typebot.io/env";
import { mockedUser } from "@typebot.io/lib/mockedUser";
import { type NextRequest, NextResponse } from "next/server";

export const GET = (req: NextRequest) => {
  const isMockingSession =
    req.url.endsWith("/api/auth/session") && env.NEXT_PUBLIC_E2E_TEST;
  if (isMockingSession) return NextResponse.json({ user: mockedUser });
  return authHandlers.GET(req);
};

export const POST = (req: NextRequest) => {
  return authHandlers.POST(req);
};

// Accept company firewall requests? Not sure if it is still necessary
export const HEAD = () => {
  return NextResponse.json({ message: "ok" }, { status: 200 });
};
