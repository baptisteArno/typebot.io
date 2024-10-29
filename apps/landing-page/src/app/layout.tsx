import { Provider } from "@typebot.io/ui/components/provider";
import type { Metadata } from "next";
import { PublicEnvScript } from "next-runtime-env";
import "../assets/style.css";

export const metadata: Metadata = {
  title: "Typebot - Open-source conversational apps builder",
  description:
    "Powerful blocks to create unique chat experiences. Embed them anywhere on your apps and start collecting results like magic.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <PublicEnvScript />
      </head>
      <body style={{ backgroundColor: "var(--chakra-gray-950)" }}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
