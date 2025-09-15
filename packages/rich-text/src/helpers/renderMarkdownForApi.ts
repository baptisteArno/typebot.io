/**
 * Clean up remark-stringify output for display in WhatsApp or a plain API response.
 * - Unescapes harmless/desired Markdown punctuation so it looks natural.
 * - Decodes numeric and common named HTML entities.
 * - Removes exactly one trailing newline (preserves trailing spaces).
 *
 * Assumes user-generated content; not meant for hostile HTML.
 */
const UNESCAPE_RE = /(?<!\\)\\([()[\]<>*_~`|!&])/g; // unescape \ ( ) [ ] < > * _ ~ ` | ! &
const ENTITY_NUM_RE = /&#(?:x([0-9a-fA-F]+)|([0-9]+));/g; // hex or decimal numeric entities
const ENTITY_NAMED_RE = /&(amp|lt|gt|quot|apos);/g; // common named entities only
const TRAIL_NL_RE = /\r?\n$/;

export const renderMarkdownForApi = (input: string): string => {
  let out = input;

  // 1) Unescape selected Markdown punctuation (keeps \\ escapes intact)
  if (UNESCAPE_RE.test(out)) {
    out = out.replace(UNESCAPE_RE, (_, ch: string) => ch);
  }

  // 2a) Decode numeric HTML entities
  if (ENTITY_NUM_RE.test(out)) {
    out = out.replace(
      ENTITY_NUM_RE,
      (_, hex: string | undefined, dec: string | undefined) => {
        const code =
          hex != null
            ? parseInt(hex, 16)
            : dec != null
              ? parseInt(dec, 10)
              : NaN;

        if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return _;
        try {
          return String.fromCodePoint(code);
        } catch {
          return _;
        }
      },
    );
  }

  // 2b) Decode a few common named entities
  if (ENTITY_NAMED_RE.test(out)) {
    out = out.replace(ENTITY_NAMED_RE, (_, name: string) => {
      switch (name) {
        case "amp":
          return "&";
        case "lt":
          return "<";
        case "gt":
          return ">";
        case "quot":
          return '"';
        case "apos":
          return "'";
        default:
          return `&${name};`; // shouldn't happen with this regex
      }
    });
  }

  // 3) Remove exactly one final newline (if present)
  out = out.replace(TRAIL_NL_RE, "");

  return out;
};
