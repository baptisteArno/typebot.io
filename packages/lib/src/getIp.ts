import type { NextRequest } from "next/server";

export const getIp = (req: NextRequest): string | null => {
  let ip = req.headers.get("x-real-ip");
  if (!ip) {
    const forwardedFor = req.headers.get("x-forwarded-for");
    ip = forwardedFor?.split(",").at(0) ?? null;
  }
  return ip;
};
