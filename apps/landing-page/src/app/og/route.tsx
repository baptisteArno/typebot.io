import { env } from "@typebot.io/env";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const postTitle = searchParams.get("title");

  const font = fetch(
    new URL("../../assets/Outfit-Medium.ttf", import.meta.url),
  ).then((res) => res.arrayBuffer());
  const fontData = await font;

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        backgroundImage: `url(${env.LANDING_PAGE_URL}/images/og-bg.png)`,
      }}
    >
      <div
        style={{
          marginLeft: 190,
          marginRight: 190,
          display: "flex",
          fontSize: 130,
          fontFamily: "Outfit",
          letterSpacing: "-0.05em",
          fontStyle: "normal",
          color: "white",
          lineHeight: "120px",
          whiteSpace: "pre-wrap",
        }}
      >
        {postTitle}
      </div>
    </div>,
    {
      width: 1280,
      height: 720,
      fonts: [
        {
          name: "Outfit",
          data: fontData,
          style: "normal",
        },
      ],
    },
  );
}
