import type { ThemeTemplate } from "@typebot.io/theme/schemas";
import { dequal } from "dequal";

export const areThemesEqual = (
  selectedTemplate: ThemeTemplate["theme"],
  currentTheme: ThemeTemplate["theme"],
) =>
  dequal(
    JSON.parse(JSON.stringify(selectedTemplate)),
    JSON.parse(JSON.stringify(currentTheme)),
  );
