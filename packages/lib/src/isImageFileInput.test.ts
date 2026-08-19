import { describe, expect, it } from "bun:test";
import { isImageFileInput } from "./isImageFileInput";

describe("isImageFileInput", () => {
  it("recognizes enabled image extension and MIME type allowlists", () => {
    expect(
      isImageFileInput({
        isEnabled: true,
        types: [".JPG", "png", ".jpeg", "capture=camera"],
      }),
    ).toBe(true);
    expect(
      isImageFileInput({
        isEnabled: true,
        types: ["IMAGE/PNG", "image/*"],
      }),
    ).toBe(true);
    expect(isImageFileInput({ isEnabled: true, types: [".tiff"] })).toBe(true);
  });

  it("rejects mixed or non-image file type allowlists", () => {
    expect(isImageFileInput({ isEnabled: true, types: [".jpg", ".pdf"] })).toBe(
      false,
    );
    expect(
      isImageFileInput({ isEnabled: true, types: ["application/pdf"] }),
    ).toBe(false);
    expect(
      isImageFileInput({ isEnabled: true, types: ["image/x-unknown"] }),
    ).toBe(false);
    expect(
      isImageFileInput({ isEnabled: true, types: ["capture=camera"] }),
    ).toBe(false);
  });

  it("rejects disabled, missing, and empty allowlists", () => {
    expect(isImageFileInput()).toBe(false);
    expect(isImageFileInput({ isEnabled: false, types: [".jpg"] })).toBe(false);
    expect(isImageFileInput({ isEnabled: true })).toBe(false);
    expect(isImageFileInput({ isEnabled: true, types: [] })).toBe(false);
    expect(isImageFileInput({ isEnabled: true, types: [" "] })).toBe(false);
  });
});
