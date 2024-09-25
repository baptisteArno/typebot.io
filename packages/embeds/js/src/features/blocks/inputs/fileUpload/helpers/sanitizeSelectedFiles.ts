import { getRuntimeVariable } from "@typebot.io/env/getRuntimeVariable";

type Props = {
  newFile: File;
  existingFiles: File[];
  params: {
    sizeLimit?: number;
  };
  onError: (message: { title?: string; description: string }) => void;
};
export const sanitizeNewFile = ({
  newFile,
  existingFiles,
  params,
  onError,
}: Props): File | undefined => {
  const sizeLimit =
    params.sizeLimit ??
    getRuntimeVariable("NEXT_PUBLIC_BOT_FILE_UPLOAD_MAX_SIZE");

  if (sizeLimit && newFile.size > sizeLimit * 1024 * 1024) {
    onError({
      title: "File too large",
      description: `${newFile.name} is larger than ${sizeLimit}MB`,
    });
    return;
  }

  if (existingFiles.length === 0) return newFile;

  let fileName = newFile.name;
  let counter = 1;
  while (existingFiles.some((file) => file.name === fileName)) {
    const dotIndex = newFile.name.lastIndexOf(".");
    const extension = dotIndex !== -1 ? newFile.name.slice(dotIndex) : "";
    fileName = `${newFile.name.slice(0, dotIndex)}(${counter})${extension}`;
    counter++;
  }
  return new File([newFile], fileName, { type: newFile.type });
};
