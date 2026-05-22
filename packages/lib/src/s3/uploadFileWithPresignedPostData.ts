type Props = {
  presignedUrl: string;
  formData?: Record<string, string>;
  file: File;
};

export const uploadFileWithPresignedPostData = ({
  presignedUrl,
  formData,
  file,
}: Props): Promise<Response> => {
  if (!formData || Object.keys(formData).length === 0) {
    return fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  const body = new FormData();

  for (const [key, value] of Object.entries(formData)) {
    body.append(key, value);
  }

  body.append("file", file);

  return fetch(presignedUrl, {
    method: "POST",
    body,
  });
};
