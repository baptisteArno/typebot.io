import type { FileInputBlock } from "./schema";

export const fileCaptureModeOptions = [
  "environment",
  "user",
] satisfies readonly ["environment", "user"];

export type FileCaptureMode = (typeof fileCaptureModeOptions)[number];

export const defaultFileInputOptions = {
  isRequired: true,
  isMultipleAllowed: false,
  visibility: "Auto",
  labels: {
    placeholder: `<strong>
      Click to upload
    </strong> or drag and drop<br>
    (size limit: 10MB)`,
    button: "Upload",
    clear: "Clear",
    skip: "Skip",
    success: {
      single: "File uploaded",
      multiple: "{total} files uploaded",
    },
  },
} as const satisfies FileInputBlock["options"];

export const fileVisibilityOptions = ["Auto", "Public", "Private"] as const;
