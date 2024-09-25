import type { Font } from "@typebot.io/theme/schemas";
import { CustomFontForm } from "./CustomFontForm";
import { GoogleFontForm } from "./GoogleFontForm";

type Props = {
  font: Font | undefined;
  onFontChange: (font: Font) => void;
};

export const FontForm = ({ font, onFontChange }: Props) => {
  if (!font || typeof font === "string" || font?.type === "Google")
    return <GoogleFontForm font={font} onFontChange={onFontChange} />;
  if (font.type === "Custom")
    return <CustomFontForm font={font} onFontChange={onFontChange} />;
  return null;
};
