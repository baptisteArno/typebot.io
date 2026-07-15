import { describe, expect, it } from "bun:test";
import { parseAllowedFileTypesMetadata } from "./extensionFromMimeType";

describe("parseAllowedFileTypesMetadata", () => {
  it("normalizes MIME types and extension aliases", () => {
    expect(parseAllowedFileTypesMetadata(["IMAGE/PNG"])).toEqual([
      { mimeType: "image/png", extension: "png" },
    ]);
    expect(parseAllowedFileTypesMetadata([".jpg"])).toEqual([
      { mimeType: "image/jpeg", extension: "jpeg" },
      { mimeType: "image/jpg", extension: "jpg" },
    ]);
    expect(parseAllowedFileTypesMetadata([".tiff"])).toEqual([
      { mimeType: "image/tiff", extension: "tif" },
    ]);
  });

  it("matches extensions exactly", () => {
    expect(parseAllowedFileTypesMetadata([".docx"])).toEqual([
      {
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        extension: "docx",
      },
    ]);
  });

  it("does not resolve unknown types or legacy capture tokens", () => {
    expect(parseAllowedFileTypesMetadata(["image/x-unknown"])).toEqual([]);
    expect(parseAllowedFileTypesMetadata(["capture=camera"])).toEqual([]);
  });
});
