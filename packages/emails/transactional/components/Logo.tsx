import { Img } from "@react-email/components";
import { env } from "@typebot.io/env";
// biome-ignore lint/correctness/noUnusedImports: Need it for tsx execution
import React from "react";

export const Logo = () => (
  <Img
    src={`${env.NEXTAUTH_URL}/images/logo.png`}
    width="32"
    height="32"
    alt="Typebot's Logo"
    style={{
      margin: "24px 0",
      borderRadius: "3px",
    }}
  />
);
