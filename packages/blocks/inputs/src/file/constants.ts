import type { FileInputBlock } from "./schema";

export const defaultFileInputOptions = {
  isRequired: true,
  isMultipleAllowed: false,
  visibility: "Auto",
  labels: {
    allowedFileTypes: "Allowed file types :",
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
