import type { Metadata } from "next";
import { PublicEnvScript } from "next-runtime-env";
import localFont from "next/font/local";
import "./globals.css";

export const metadata: Metadata = {
  title: "Typebot - Open-source conversational apps builder",
  description:
    "Powerful blocks to create unique chat experiences. Embed them anywhere on your apps and start collecting results like magic.",
};

const untitledSans = localFont({
  variable: "--font-untitled-sans",
  src: [
    {
      path: "../../../../packages/ui/assets/fonts/untitledSans/untitledSansRegular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../../packages/ui/assets/fonts/untitledSans/untitledSansRegularItalic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../../../packages/ui/assets/fonts/untitledSans/untitledSansMedium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../../../packages/ui/assets/fonts/untitledSans/untitledSansMediumItalic.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../../../packages/ui/assets/fonts/untitledSans/untitledSansBold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../../../packages/ui/assets/fonts/untitledSans/untitledSansBoldItalic.woff2",
      weight: "700",
      style: "italic",
    },
  ],
});

const uxumGrotesque = localFont({
  variable: "--font-uxum-grotesque",
  src: [
    {
      path: "../../../../packages/ui/assets/fonts/uxumGrotesque/uxumGrotesqueRegular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../../packages/ui/assets/fonts/uxumGrotesque/uxumGrotesqueRegularItalic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../../../packages/ui/assets/fonts/uxumGrotesque/uxumGrotesqueMedium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../../../packages/ui/assets/fonts/uxumGrotesque/uxumGrotesqueMediumItalic.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../../../packages/ui/assets/fonts/uxumGrotesque/uxumGrotesqueBold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../../../packages/ui/assets/fonts/uxumGrotesque/uxumGrotesqueBoldItalic.woff2",
      weight: "700",
      style: "italic",
    },
  ],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <PublicEnvScript />
      </head>
      <body
        className={`${untitledSans.variable} ${uxumGrotesque.variable} font-body`}
      >
        {children}
      </body>
    </html>
  );
}
