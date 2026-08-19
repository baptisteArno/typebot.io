import { describe, expect, it } from "bun:test";
import { InputBlockType } from "../constants";
import { type FileInputBlockV6, fileInputBlockSchemas } from "./schema";

describe("fileInputBlockSchemas", () => {
  it("parses existing blocks without adding a capture mode", () => {
    const existingBlock = {
      id: "file-input",
      type: InputBlockType.FILE,
      options: {
        allowedFileTypes: {
          isEnabled: true,
          types: [".jpg", ".png", ".jpeg"],
        },
      },
    } satisfies FileInputBlockV6;

    expect(fileInputBlockSchemas.v6.parse(existingBlock)).toEqual(
      existingBlock,
    );
  });

  it.each([
    "environment",
    "user",
  ])("parses the standard %s capture mode", (capture) => {
    expect(
      fileInputBlockSchemas.v6.parse({
        id: "file-input",
        type: InputBlockType.FILE,
        options: { capture },
      }).options?.capture,
    ).toBe(capture);
  });

  it("rejects non-standard capture modes", () => {
    expect(
      fileInputBlockSchemas.v6.safeParse({
        id: "file-input",
        type: InputBlockType.FILE,
        options: { capture: "camera" },
      }).success,
    ).toBe(false);
  });
});
