"use client";

import { Bubble } from "@typebot.io/nextjs";
import { colors } from "@typebot.io/ui/colors";
import { useEffect, useState } from "react";

export const TypebotBubble = () => {
  const [mountBubble, setMountBubble] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMountBubble(true);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  if (!mountBubble) return null;
  return (
    <Bubble
      typebot="typebot-support"
      theme={{ button: { backgroundColor: colors.gray.dark[3] } }}
    />
  );
};
