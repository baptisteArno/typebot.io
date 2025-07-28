import { sendRequest } from "@typebot.io/lib/utils";

type UploadFileProps = {
  apiHost: string;
  files: {
    file: File;
    input: {
      sessionId: string;
      blockId: string;
      fileName: string;
    };
  }[];
  onUploadProgress?: (props: { fileIndex: number; progress: number }) => void;
};

type UrlList = ({
  url: string;
  type: string;
} | null)[];

export const uploadFiles = async ({
  apiHost,
  files,
  onUploadProgress,
}: UploadFileProps): Promise<
  { type: "success"; urls: UrlList } | { type: "error"; error: string }
> => {
  const urls: UrlList = [];
  const errors: string[] = [];
  let i = 0;
  for (const { input, file } of files) {
    onUploadProgress &&
      onUploadProgress({ progress: (i / files.length) * 100, fileIndex: i });
    i += 1;
    const { data, error } = await sendRequest<{
      presignedUrl: string;
      formData: Record<string, string>;
      fileUrl: string;
    }>({
      method: "POST",
      url: `${apiHost}/api/v3/generate-upload-url`,
      body: {
        fileName: input.fileName,
        sessionId: input.sessionId,
        fileType: file.type,
        blockId: input.blockId,
      },
    });

    if (error) {
      errors.push(error.message);
      continue;
    }

    if (!data?.presignedUrl) continue;
    else {
      const formData = new FormData();
      Object.entries(data.formData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("file", file);
      const upload = await fetch(data.presignedUrl, {
        method: "POST",
        body: formData,
      });

      if (!upload.ok) continue;

      urls.push({ url: data.fileUrl, type: file.type });
    }
  }
  return errors.length > 0
    ? { type: "error", error: errors.join(", ") }
    : { type: "success", urls };
};
