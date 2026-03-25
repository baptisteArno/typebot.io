import type { ButtonProps } from "@typebot.io/ui/components/Button";
import { UploadButton as UploadButtonPrimitive } from "@typebot.io/ui/components/UploadButton";
import type { FilePathUploadProps } from "@/features/upload/api/generateUploadUrl";
import { type CompressPreset, compressFile } from "@/helpers/compressFile";
import { orpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";

type UploadButtonProps = {
  fileType: "image" | "audio";
  filePathProps: FilePathUploadProps;
  onFileUploaded: (url: string) => void;
  compressPreset?: CompressPreset;
} & ButtonProps;

export const UploadButton = ({
  fileType,
  filePathProps,
  onFileUploaded,
  compressPreset,
  children,
  variant,
  size = "sm",
}: UploadButtonProps) => {
  const handleFileUploadRequest = async (rawFile: File) => {
    const file = await compressFile(rawFile, compressPreset);
    const data = await orpc.generateUploadUrl.call({
      filePathProps,
      fileType: file.type,
    });
    const formData = new FormData();
    Object.entries(data.formData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("file", file);
    const upload = await fetch(data.presignedUrl, {
      method: "POST",
      body: formData,
    });
    if (!upload.ok) {
      toast({
        description: "Error while trying to upload the file.",
      });
      return null;
    }
    return `${data.fileUrl}?v=${Date.now()}`;
  };

  return (
    <UploadButtonPrimitive
      accept={fileType === "image" ? "image/avif, image/*" : "audio/*"}
      variant={variant}
      size={size}
      onFileUploadRequest={handleFileUploadRequest}
      onValueCommit={onFileUploaded}
    >
      {children}
    </UploadButtonPrimitive>
  );
};
