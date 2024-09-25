import dynamic from "next/dynamic";

export const Standard = dynamic(
  () => import("@typebot.io/react").then((mod) => mod.Standard),
  {
    ssr: false,
  },
);

export const Bubble = dynamic(
  () => import("@typebot.io/react").then((mod) => mod.Bubble),
  {
    ssr: false,
  },
);

export const Popup = dynamic(
  () => import("@typebot.io/react").then((mod) => mod.Popup),
  {
    ssr: false,
  },
);
