import { SendButton, Spinner } from "@/components/SendButton";
import { useAnswers } from "@/providers/AnswersProvider";
import { useTypebot } from "@/providers/TypebotProvider";
import type { InputSubmitContent } from "@/types";
import { defaultFileInputOptions } from "@typebot.io/blocks-inputs/file/constants";
import type { FileInputBlock } from "@typebot.io/blocks-inputs/file/schema";
import {
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  useState,
} from "react";
import { uploadFiles } from "../helpers/uploadFiles";

type Props = {
  block: FileInputBlock;
  onSubmit: (url: InputSubmitContent) => void;
  onSkip: () => void;
};

export const FileUploadForm = ({
  block: { id, options },
  onSubmit,
  onSkip,
}: Props) => {
  const { isMultipleAllowed, labels, isRequired } = options ?? {};
  const sizeLimit =
    options && "sizeLimit" in options ? options?.sizeLimit : undefined;
  const { isPreview, currentTypebotId } = useTypebot();
  const { resultId } = useAnswers();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressPercent, setUploadProgressPercent] = useState(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    onNewFiles(e.target.files);
  };

  const onNewFiles = (files: FileList) => {
    setErrorMessage(undefined);
    const newFiles = Array.from(files);
    if (newFiles.some((file) => file.size > (sizeLimit ?? 10) * 1024 * 1024))
      return setErrorMessage(`A file is larger than ${sizeLimit ?? 10}MB`);
    if (!isMultipleAllowed && files) return startSingleFileUpload(newFiles[0]);
    setSelectedFiles([...selectedFiles, ...newFiles]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;
    startFilesUpload(selectedFiles);
  };

  const startSingleFileUpload = async (file: File) => {
    if (isPreview)
      return onSubmit({
        label: `File uploaded`,
        value: "http://fake-upload-url.com",
      });
    setIsUploading(true);
    const urls = await uploadFiles({
      basePath: `/api/typebots/${currentTypebotId}/blocks/${id}`,
      files: [
        {
          file,
          path: `public/results/${resultId}/${id}/${file.name}`,
        },
      ],
    });
    setIsUploading(false);
    if (urls.length)
      return onSubmit({ label: `File uploaded`, value: urls[0] ?? "" });
    setErrorMessage("An error occured while uploading the file");
  };
  const startFilesUpload = async (files: File[]) => {
    if (isPreview)
      return onSubmit({
        label: `${files.length} file${files.length > 1 ? "s" : ""} uploaded`,
        value: files
          .map((_, idx) => `http://fake-upload-url.com/${idx}`)
          .join(", "),
      });
    setIsUploading(true);
    const urls = await uploadFiles({
      basePath: `/api/typebots/${currentTypebotId}/blocks/${id}`,
      files: files.map((file) => ({
        file: file,
        path: `public/results/${resultId}/${id}/${file.name}`,
      })),
      onUploadProgress: setUploadProgressPercent,
    });
    setIsUploading(false);
    setUploadProgressPercent(0);
    if (urls.length !== files.length)
      return setErrorMessage("An error occured while uploading the files");
    onSubmit({
      label: `${urls.length} file${urls.length > 1 ? "s" : ""} uploaded`,
      value: urls.join(", "),
    });
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => setIsDraggingOver(false);

  const handleDropFile = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.dataTransfer.files) return;
    onNewFiles(e.dataTransfer.files);
  };

  const clearFiles = () => setSelectedFiles([]);

  return (
    <form className="flex flex-col w-full" onSubmit={handleSubmit}>
      <label
        htmlFor="dropzone-file"
        className={
          "typebot-upload-input py-6 flex flex-col justify-center items-center w-full bg-gray-50 rounded-lg border-2 border-gray-300 border-dashed cursor-pointer hover:bg-gray-100 px-8 mb-2 " +
          (isDraggingOver ? "dragging-over" : "")
        }
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropFile}
      >
        {isUploading ? (
          <>
            {selectedFiles.length === 1 ? (
              <Spinner />
            ) : (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="upload-progress-bar h-2.5 rounded-full"
                  style={{
                    width: `${
                      uploadProgressPercent > 0 ? uploadProgressPercent : 10
                    }%`,
                    transition: "width 150ms cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-col justify-center items-center">
              {selectedFiles.length ? (
                <span className="relative">
                  <FileIcon />
                  <div
                    className="total-files-indicator flex items-center justify-center absolute -right-1 rounded-full px-1 h-4"
                    style={{ bottom: "5px" }}
                  >
                    {selectedFiles.length}
                  </div>
                </span>
              ) : (
                <UploadIcon />
              )}
              <p
                className="text-sm text-gray-500 text-center"
                dangerouslySetInnerHTML={{ __html: labels?.placeholder ?? "" }}
              />
            </div>
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              multiple={isMultipleAllowed}
              onChange={handleFileChange}
            />
          </>
        )}
      </label>
      {selectedFiles.length === 0 && isRequired === false && (
        <div className="flex justify-end">
          <button
            className={
              "py-2 px-4 justify-center font-semibold rounded-md text-white focus:outline-none flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 transition-all filter hover:brightness-90 active:brightness-75 typebot-button "
            }
            onClick={onSkip}
          >
            {labels?.skip ?? defaultFileInputOptions.labels.skip}
          </button>
        </div>
      )}
      {isMultipleAllowed && selectedFiles.length > 0 && !isUploading && (
        <div className="flex justify-end">
          <div className="flex">
            {selectedFiles.length && (
              <button
                className={
                  "secondary-button py-2 px-4 justify-center font-semibold rounded-md text-white focus:outline-none flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 transition-all filter hover:brightness-90 active:brightness-75 mr-2"
                }
                onClick={clearFiles}
              >
                {labels?.clear ?? defaultFileInputOptions.labels.clear}
              </button>
            )}
            <SendButton
              type="submit"
              label={
                labels?.button === defaultFileInputOptions.labels.button
                  ? `${labels.button} ${selectedFiles.length} file${
                      selectedFiles.length > 1 ? "s" : ""
                    }`
                  : (labels?.button ?? "")
              }
              disableIcon
            />
          </div>
        </div>
      )}
      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
    </form>
  );
};

const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mb-3"
  >
    <polyline points="16 16 12 12 8 16"></polyline>
    <line x1="12" y1="12" x2="12" y2="21"></line>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
    <polyline points="16 16 12 12 8 16"></polyline>
  </svg>
);

const FileIcon = () => (
  <svg
    className="mb-3"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
    <polyline points="13 2 13 9 20 9"></polyline>
  </svg>
);
