import { Select } from "@/components/inputs/Select";
import { env } from "@typebot.io/env";
import { defaultFontFamily } from "@typebot.io/theme/constants";
import type { GoogleFont } from "@typebot.io/theme/schemas";
import { useEffect, useState } from "react";

type Props = {
  font: GoogleFont | string | undefined;
  onFontChange: (font: GoogleFont) => void;
};

export const GoogleFontForm = ({ font, onFontChange }: Props) => {
  const [currentFont, setCurrentFont] = useState(
    (typeof font === "string" ? font : font?.family) ?? defaultFontFamily,
  );
  const [googleFonts, setGoogleFonts] = useState<string[]>([]);

  useEffect(() => {
    fetchPopularFonts().then(setGoogleFonts);
  }, []);

  const fetchPopularFonts = async () => {
    if (!env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY) return [];
    try {
      const response = await fetch(
        `https://www.googleapis.com/webfonts/v1/webfonts?key=${env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY}&sort=popularity`,
      );
      return (await response.json()).items.map(
        (item: { family: string }) => item.family,
      );
    } catch (error) {
      console.error("Failed to fetch Google Fonts:", error);
      return [];
    }
  };

  const handleFontSelected = (nextFont: string | undefined) => {
    if (nextFont === currentFont || !nextFont) return;
    setCurrentFont(nextFont);
    onFontChange({ type: "Google", family: nextFont });
  };

  return (
    <Select
      selectedItem={currentFont}
      items={googleFonts}
      onSelect={handleFontSelected}
    />
  );
};
