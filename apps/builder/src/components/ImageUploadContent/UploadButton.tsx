import type { FilePathUploadProps } from "@/features/upload/api/generateUploadUrl";
import { compressFile } from "@/helpers/compressFile";
import { toast } from "@/lib/toast";
import { trpc } from "@/lib/trpc";
import { Button, type ButtonProps, chakra } from "@chakra-ui/react";
import type { ChangeEvent } from "react";
import { useId, useState } from "react";

type UploadButtonProps = {
  fileType: "image" | "audio";
  filePathProps: FilePathUploadProps;
  onFileUploaded: (url: string) => void;
} & ButtonProps;

export const UploadButton = ({
  fileType,
  filePathProps,
  onFileUploaded,
  ...props
}: UploadButtonProps) => {
  const id = useId();
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File>();

  const { mutate } = trpc.generateUploadUrl.useMutation({
    onSettled: () => {
      setIsUploading(false);
    },
    onSuccess: async (data) => {
      if (!file) return;
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
        return;
      }

      onFileUploaded(data.fileUrl + "?v=" + Date.now());
    },
  });

  const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target?.files) return;
    setIsUploading(true);
    const file = e.target.files[0] as File | undefined;
    if (!file)
      return toast({
        description: "Could not read file.",
      });
    setFile(await compressFile(file));
    mutate({
      filePathProps,
      fileType: file.type,
    });
  };

  return (
    <>
      <chakra.input
        data-testid="file-upload-input"
        type="file"
        id={`file-input-${id}`}
        display="none"
        onChange={handleInputChange}
        accept={fileType === "image" ? "image/*" : "audio/*"}
      />
      <Button
        as="label"
        size="sm"
        htmlFor={`file-input-${id}`}
        cursor="pointer"
        isLoading={isUploading}
        {...props}
      >
        {props.children}
      </Button>
    </>
  );
};
