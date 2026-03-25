import type { ChangeEvent } from "react";
import { useId, useState } from "react";
import { Upload01Icon } from "../icons/Upload01Icon";
import type { VariantProps } from "../lib/cva";
import { buttonVariants } from "./Button";

type Props = {
  accept: string;
  children?: React.ReactNode;
  onFileUploadRequest: (file: File) => Promise<string | null>;
  onValueCommit: (url: string) => void;
} & VariantProps<typeof buttonVariants>;

export const UploadButton = ({
  accept,
  children,
  variant,
  size,
  onFileUploadRequest,
  onValueCommit,
}: Props) => {
  const [isUploading, setIsUploading] = useState(false);
  const id = useId();

  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const url = await onFileUploadRequest(file);
    setIsUploading(false);
    if (url === null) return;
    onValueCommit(url);
  };

  return (
    <>
      <input
        data-testid="file-upload-input"
        type="file"
        id={`file-input-${id}`}
        className="hidden"
        onChange={handleInputChange}
        accept={accept}
      />
      <label
        htmlFor={`file-input-${id}`}
        className={buttonVariants({ variant, size })}
        data-disabled={isUploading}
      >
        {children ?? (
          <>
            <Upload01Icon />
            Upload
          </>
        )}
      </label>
    </>
  );
};
