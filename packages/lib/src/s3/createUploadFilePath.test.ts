import { describe, expect, it } from "bun:test";
import {
  createUploadFileName,
  createUploadFilePath,
  createUploadSlotFilePath,
  isUnsafeUploadFileType,
  normalizeUploadFileType,
  parseUploadPathSegment,
  resolveStoredUploadFileType,
  resolveUploadContentDisposition,
  resolveUploadFileType,
} from "./createUploadFilePath";

describe("createUploadFilePath", () => {
  it("creates a server-generated file name with the MIME-derived extension", () => {
    const fileName = createUploadFileName("image/png");

    expect(fileName.endsWith(".png")).toBe(true);
    expect(fileName).not.toContain("/");
    expect(fileName).not.toContain("payload");
  });

  it("creates a path under the provided server prefix", () => {
    const filePath = createUploadFilePath({
      prefix: "public/tmp/typebots/typebot-id/blocks/block-id",
      fileType: "application/pdf",
    });

    expect(
      filePath.startsWith("public/tmp/typebots/typebot-id/blocks/block-id/"),
    ).toBe(true);
    expect(filePath.endsWith(".pdf")).toBe(true);
  });

  it("creates a stable slot path without trusting nested path segments", () => {
    expect(
      createUploadSlotFilePath({
        prefix: "public/users/user-id",
        fileName: "avatar",
      }),
    ).toBe("public/users/user-id/avatar");

    expect(() =>
      createUploadSlotFilePath({
        prefix: "public/users/user-id",
        fileName: "avatar/evil.png",
      }),
    ).toThrow("Invalid upload path segment");
  });

  it("normalizes content types before policy validation", () => {
    expect(normalizeUploadFileType("Text/HTML; charset=utf-8")).toBe(
      "text/html",
    );
    expect(resolveUploadFileType(undefined)).toBe("application/octet-stream");
  });

  it("flags active web content types as unsafe", () => {
    expect(isUnsafeUploadFileType("image/svg+xml")).toBe(true);
    expect(isUnsafeUploadFileType("application/javascript")).toBe(true);
    expect(isUnsafeUploadFileType("image/png")).toBe(false);
  });

  it("stores active web content as generic downloads", () => {
    expect(resolveStoredUploadFileType("image/svg+xml")).toBe(
      "application/octet-stream",
    );
    expect(resolveStoredUploadFileType("image/png")).toBe("image/png");
    expect(resolveUploadContentDisposition("image/svg+xml")).toBe("attachment");
    expect(resolveUploadContentDisposition("image/png")).toBeUndefined();
  });

  it("rejects unsafe upload path segments", () => {
    expect(parseUploadPathSegment(" icon ")).toBe("icon");
    expect(parseUploadPathSegment("bubble-icon.png")).toBe("bubble-icon.png");
    expect(() => parseUploadPathSegment("../avatar")).toThrow(
      "Invalid upload path segment",
    );
    expect(() => parseUploadPathSegment("avatar/evil")).toThrow(
      "Invalid upload path segment",
    );
  });
});
