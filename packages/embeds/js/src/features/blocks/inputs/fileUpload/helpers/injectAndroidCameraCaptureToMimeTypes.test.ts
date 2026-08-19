import { describe, expect, it } from "bun:test";
import { injectAndroidCameraCaptureToMimeTypes } from "./injectAndroidCameraCaptureToMimeTypes";

describe("injectAndroidCameraCaptureToMimeTypes", () => {
  it("returns an empty accept value when no file types are configured", () => {
    expect(injectAndroidCameraCaptureToMimeTypes()).toBe("");
    expect(injectAndroidCameraCaptureToMimeTypes([])).toBe("");
  });

  it("keeps the existing workaround for image MIME types", () => {
    expect(
      injectAndroidCameraCaptureToMimeTypes(["IMAGE/PNG", "image/*"]),
    ).toBe("IMAGE/PNG, image/*, capture=camera");
  });

  it("adds matching image MIME types for image extensions", () => {
    expect(
      injectAndroidCameraCaptureToMimeTypes([".JPG", ".jpeg", "png"]),
    ).toBe(
      ".JPG, .jpeg, png, image/jpeg, image/jpg, image/png, capture=camera",
    );
  });

  it("uses a clean image accept list with a standard capture attribute", () => {
    expect(
      injectAndroidCameraCaptureToMimeTypes(
        [".jpg", ".png", ".jpeg", "capture=camera"],
        "environment",
      ),
    ).toBe(".jpg, .png, .jpeg, image/jpeg, image/jpg, image/png");
  });

  it("recognizes equivalent image extensions", () => {
    expect(injectAndroidCameraCaptureToMimeTypes([".tiff"])).toBe(
      ".tiff, image/tiff, capture=camera",
    );
  });

  it("does not duplicate extensions, MIME types, or the workaround", () => {
    expect(
      injectAndroidCameraCaptureToMimeTypes([
        " .PNG ",
        "png",
        "image/png",
        "IMAGE/PNG",
        "capture=camera",
        "CAPTURE=CAMERA",
      ]),
    ).toBe(".PNG, image/png, capture=camera");
  });

  it("prefers dotted extensions when removing duplicates", () => {
    expect(injectAndroidCameraCaptureToMimeTypes(["pdf", ".PDF"])).toBe(".PDF");
    expect(injectAndroidCameraCaptureToMimeTypes(["png", ".PNG"])).toBe(
      ".PNG, image/png, capture=camera",
    );
  });

  it("does not change non-image lists beyond removing duplicates", () => {
    expect(
      injectAndroidCameraCaptureToMimeTypes([".PDF", "pdf", "application/pdf"]),
    ).toBe(".PDF, application/pdf");
  });

  it("enriches mixed lists while preserving non-image types", () => {
    expect(
      injectAndroidCameraCaptureToMimeTypes([".pdf", ".PnG", "video/mp4"]),
    ).toBe(".pdf, .PnG, video/mp4, image/png, capture=camera");
  });
});
