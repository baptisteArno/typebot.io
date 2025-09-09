import { chakra } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import {
  type ButtonProps,
  buttonVariants,
} from "@typebot.io/ui/components/Button";
import type { ChangeEvent } from "react";
import { useId, useState } from "react";
import type { FilePathUploadProps } from "@/features/upload/api/generateUploadUrl";
import { compressFile } from "@/helpers/compressFile";
import { trpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import { UploadIcon } from "../icons";

type UploadButtonProps = {
  fileType: "image" | "audio";
  filePathProps: FilePathUploadProps;
  onFileUploaded: (url: string) => void;
} & ButtonProps;

export const UploadButton = ({
  fileType,
  filePathProps,
  onFileUploaded,
  children,
  variant,
  size = "sm",
}: UploadButtonProps) => {
  const id = useId();
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File>();

  const { mutate } = useMutation(
    trpc.generateUploadUrl.mutationOptions({
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
    }),
  );

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
        accept={fileType === "image" ? "image/avif, image/*" : "audio/*"}
      />
      <label
        htmlFor={`file-input-${id}`}
        className={buttonVariants({ variant, size })}
        data-disabled={isUploading}
      >
        <UploadIcon />
        {children}
      </label>
    </>
  );
};
