import { isEmpty } from "@typebot.io/lib/utils";
import domPurify from "dompurify";

const normalizeSanitizedMarkup = (sanitizedMarkup: string) => {
  const trimmedMarkup = sanitizedMarkup.trim();
  return isEmpty(trimmedMarkup) ? undefined : trimmedMarkup;
};

export const sanitizeSvgFragment = (svgMarkup?: string) =>
  normalizeSanitizedMarkup(
    domPurify.sanitize(svgMarkup ?? "", {
      USE_PROFILES: { svg: true },
      FORBID_TAGS: ["foreignObject"],
    }),
  );

export const sanitizeHtmlFragment = (htmlMarkup?: string) =>
  normalizeSanitizedMarkup(
    domPurify.sanitize(htmlMarkup ?? "", {
      USE_PROFILES: { html: true },
    }),
  );
