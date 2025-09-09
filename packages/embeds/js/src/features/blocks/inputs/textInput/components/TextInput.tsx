import { fixWebmDuration } from "@fix-webm-duration/fix";
import { defaultTextInputOptions } from "@typebot.io/blocks-inputs/text/constants";
import type { TextInputBlock } from "@typebot.io/blocks-inputs/text/schema";
import { getRuntimeVariable } from "@typebot.io/env/getRuntimeVariable";
import { guessDeviceIsMobile } from "@typebot.io/lib/guessDeviceIsMobile";
import { isDefined } from "@typebot.io/lib/utils";
import { cx } from "@typebot.io/ui/lib/cva";
import {
  createSignal,
  For,
  Match,
  onCleanup,
  onMount,
  Show,
  Switch,
} from "solid-js";
import { Button } from "@/components/Button";
import { MicrophoneIcon } from "@/components/icons/MicrophoneIcon";
import { ShortTextInput } from "@/components/inputs/ShortTextInput";
import { Textarea } from "@/components/inputs/Textarea";
import { SendButton } from "@/components/SendButton";
import { TextInputAddFileButton } from "@/components/TextInputAddFileButton";
import type { CommandData } from "@/features/commands/types";
import type { Attachment, BotContext, InputSubmitContent } from "@/types";
import { guessApiHost } from "@/utils/guessApiHost";
import { toaster } from "@/utils/toaster";
import { SelectedFile } from "../../fileUpload/components/SelectedFile";
import { sanitizeNewFile } from "../../fileUpload/helpers/sanitizeSelectedFiles";
import { uploadFiles } from "../../fileUpload/helpers/uploadFiles";
import { VoiceRecorder } from "./VoiceRecorder";

type Props = {
  block: TextInputBlock;
  defaultValue?: string;
  context: BotContext;
  onSubmit: (value: InputSubmitContent) => void;
};

export const TextInput = (props: Props) => {
  const [inputValue, setInputValue] = createSignal(props.defaultValue ?? "");
  const [selectedFiles, setSelectedFiles] = createSignal<File[]>([]);
  const [uploadProgress, setUploadProgress] = createSignal<
    { fileIndex: number; progress: number } | undefined
  >(undefined);
  const [isDraggingOver, setIsDraggingOver] = createSignal(false);
  const [recordingStatus, setRecordingStatus] = createSignal<
    "started" | "asking" | "stopped"
  >("stopped");
  let inputRef: HTMLInputElement | HTMLTextAreaElement | undefined;
  let mediaRecorder: MediaRecorder | undefined;
  let recordedChunks: Blob[] = [];

  const handleInput = (inputValue: string) => setInputValue(inputValue);

  const checkIfInputIsValid = () =>
    inputRef?.value !== "" && inputRef?.reportValidity();

  const submit = async () => {
    if (recordingStatus() === "started" && mediaRecorder) {
      mediaRecorder.stop();
      return;
    }
    if (checkIfInputIsValid()) {
      let attachments: Attachment[] | undefined;
      if (selectedFiles().length > 0) {
        setUploadProgress(undefined);
        const result = await uploadFiles({
          apiHost:
            props.context.apiHost ?? guessApiHost({ ignoreChatApiUrl: true }),
          files: selectedFiles().map((file) => ({
            file: file,
            input: {
              blockId: props.block.id,
              sessionId: props.context.sessionId,
              fileName: file.name,
            },
          })),
          onUploadProgress: setUploadProgress,
        });
        if (result.type === "error") {
          toaster.create({
            description: result.error,
          });
          return;
        }
        attachments = result.urls
          ?.map((urls, index) =>
            urls
              ? {
                  ...urls,
                  blobUrl: URL.createObjectURL(selectedFiles()[index]),
                }
              : null,
          )
          .filter(isDefined);
      }
      props.onSubmit({
        type: "text",
        value: inputRef?.value ?? inputValue(),
        attachments,
      });
    } else inputRef?.focus();
  };

  const submitWhenEnter = (e: KeyboardEvent) => {
    if (props.block.options?.isLong) return;
    if (e.key === "Enter") submit();
  };

  const submitIfCtrlEnter = (e: KeyboardEvent) => {
    if (!props.block.options?.isLong) return;
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
  };

  onMount(() => {
    if (!guessDeviceIsMobile() && inputRef)
      inputRef.focus({
        preventScroll: true,
      });
    window.addEventListener("message", processIncomingEvent);
  });

  onCleanup(() => {
    window.removeEventListener("message", processIncomingEvent);
  });

  const processIncomingEvent = (event: MessageEvent<CommandData>) => {
    const { data } = event;
    if (!data.isFromTypebot) return;
    if (data.command === "setInputValue") setInputValue(data.value);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => setIsDraggingOver(false);

  const handleDropFile = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.dataTransfer?.files) return;
    onNewFiles(e.dataTransfer.files);
  };

  const onNewFiles = (files: FileList) => {
    const newFiles = Array.from(files)
      .map((file) =>
        sanitizeNewFile({
          existingFiles: selectedFiles(),
          newFile: file,
          params: {
            sizeLimit: getRuntimeVariable(
              "NEXT_PUBLIC_BOT_FILE_UPLOAD_MAX_SIZE",
            )
              ? Number(
                  getRuntimeVariable("NEXT_PUBLIC_BOT_FILE_UPLOAD_MAX_SIZE"),
                )
              : undefined,
          },
          context: props.context,
          onError: ({ description }) => {
            toaster.create({
              description,
            });
          },
        }),
      )
      .filter(isDefined);

    if (newFiles.length === 0) return;

    setSelectedFiles((selectedFiles) => [...newFiles, ...selectedFiles]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((selectedFiles) =>
      selectedFiles.filter((_, i) => i !== index),
    );
  };

  const recordVoice = () => {
    setRecordingStatus("asking");
  };

  const handleRecordingConfirmed = (stream: MediaStream) => {
    let startTime: number;
    const mimeType = MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : "video/mp4";

    mediaRecorder = new MediaRecorder(stream, { mimeType });
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size === 0) return;
      recordedChunks.push(event.data);
    };
    mediaRecorder.onstart = () => {
      startTime = Date.now();
    };
    mediaRecorder.onstop = async () => {
      if (recordingStatus() !== "started" || recordedChunks.length === 0)
        return;

      const duration = Date.now() - startTime;

      const blob = await fixWebmDuration(
        new Blob(recordedChunks, { type: mimeType }),
        duration,
      );

      const audioFile = new File(
        [blob],
        `rec-${props.block.id}-${Date.now()}.${
          mimeType === "audio/webm" ? "webm" : "mp4"
        }`,
        {
          type: mimeType,
        },
      );

      setUploadProgress(undefined);
      const result = await uploadFiles({
        apiHost:
          props.context.apiHost ?? guessApiHost({ ignoreChatApiUrl: true }),
        files: [
          {
            file: audioFile,
            input: {
              blockId: props.block.id,
              sessionId: props.context.sessionId,
              fileName: audioFile.name,
            },
          },
        ],
        onUploadProgress: setUploadProgress,
      });
      if (result.type === "error") {
        toaster.create({
          description: result.error,
        });
        return;
      }
      const urls = result.urls.filter(isDefined).map((url) => url.url);
      props.onSubmit({
        type: "recording",
        url: urls[0],
        blobUrl: URL.createObjectURL(audioFile),
      });
    };
    mediaRecorder.start();
    setRecordingStatus("started");
  };

  const handleRecordingAbort = () => {
    mediaRecorder?.stop();
    setRecordingStatus("stopped");
    mediaRecorder = undefined;
    recordedChunks = [];
  };

  return (
    <div
      class={cx(
        "typebot-input-form flex w-full gap-2 items-end",
        props.block.options?.isLong && recordingStatus() !== "started"
          ? "max-w-full"
          : "max-w-[350px]",
      )}
      onKeyDown={submitWhenEnter}
      onDrop={handleDropFile}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div
        class={cx(
          "relative typebot-input flex-col w-full",
          isDraggingOver() && "filter brightness-95",
        )}
      >
        <VoiceRecorder
          recordingStatus={recordingStatus()}
          buttonsTheme={props.context.typebot.theme.chat?.buttons}
          context={props.context}
          onRecordingConfirmed={handleRecordingConfirmed}
          onAbortRecording={handleRecordingAbort}
        />
        <Show when={recordingStatus() !== "started"}>
          <Show when={selectedFiles().length}>
            <div
              class="p-2 flex gap-2 border-input-border overflow-auto"
              style={{ "border-bottom-width": "1px" }}
            >
              <For each={selectedFiles()}>
                {(file, index) => (
                  <SelectedFile
                    file={file}
                    uploadProgressPercent={
                      uploadProgress()
                        ? uploadProgress()?.fileIndex === index()
                          ? 20
                          : index() < (uploadProgress()?.fileIndex ?? 0)
                            ? 100
                            : 0
                        : undefined
                    }
                    onRemoveClick={() => removeSelectedFile(index())}
                  />
                )}
              </For>
            </div>
          </Show>
          <div
            class={cx(
              "flex justify-between px-2",
              props.block.options?.isLong ? "items-end" : "items-center",
            )}
          >
            {props.block.options?.isLong ? (
              <Textarea
                ref={inputRef as HTMLTextAreaElement}
                onInput={handleInput}
                onKeyDown={submitIfCtrlEnter}
                value={inputValue()}
                inputmode={props.block.options?.inputMode}
                placeholder={
                  props.block.options?.labels?.placeholder ??
                  defaultTextInputOptions.labels.placeholder
                }
              />
            ) : (
              <ShortTextInput
                ref={inputRef as HTMLInputElement}
                onInput={handleInput}
                value={inputValue()}
                inputmode={props.block.options?.inputMode}
                placeholder={
                  props.block.options?.labels?.placeholder ??
                  defaultTextInputOptions.labels.placeholder
                }
              />
            )}
            <Show
              when={
                (props.block.options?.attachments?.isEnabled ??
                  defaultTextInputOptions.attachments.isEnabled) &&
                props.block.options?.attachments?.saveVariableId
              }
            >
              <TextInputAddFileButton
                onNewFiles={onNewFiles}
                class={cx(props.block.options?.isLong ? "ml-2" : undefined)}
              />
            </Show>
          </div>
        </Show>
      </div>
      <Switch>
        <Match
          when={
            !inputValue() &&
            recordingStatus() !== "started" &&
            props.block.options?.audioClip?.isEnabled
          }
        >
          <Button
            class="h-[56px] flex items-center"
            on:click={recordVoice}
            aria-label="Record voice"
          >
            <MicrophoneIcon class="flex w-6 h-6" />
          </Button>
        </Match>
        <Match when={true}>
          <SendButton
            type="button"
            on:click={submit}
            isDisabled={Boolean(uploadProgress())}
            class="h-[56px]"
          >
            {props.block.options?.labels?.button}
          </SendButton>
        </Match>
      </Switch>
    </div>
  );
};
