import { NextResponse } from "next/server";

export async function GET(_: Request) {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
