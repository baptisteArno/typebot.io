import { ShortTextInput } from "@/components/inputs/ShortTextInput";
import { Textarea } from "@/components/inputs/Textarea";
import type { CommandData } from "@/features/commands/types";
import type { Attachment, BotContext, InputSubmitContent } from "@/types";
import { guessApiHost } from "@/utils/guessApiHost";
import type { TextInputBlock } from "@typebot.io/blocks-inputs/text/schema";
import { guessDeviceIsMobile } from "@typebot.io/lib/guessDeviceIsMobile";
import { isDefined } from "@typebot.io/lib/utils";
import { cx } from "@typebot.io/ui/lib/cva";
import { Show, createSignal, onCleanup, onMount } from "solid-js";

type Props = {
  block: TextInputBlock;
  defaultValue?: string;
  context: BotContext;
  name: string;
  error?: boolean;
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
  const recordedChunks: Blob[] = [];

  const handleInput = (inputValue: string) => setInputValue(inputValue);

  const checkIfInputIsValid = () =>
    inputRef?.value !== "" && inputRef?.reportValidity();

  const submit = async () => {
    console.log("submit recording status: ", recordingStatus());
    console.log("submit mediaRecorder: ", mediaRecorder);

    if (recordingStatus() === "started" && mediaRecorder) {
      console.log("stopping recording ");

      mediaRecorder.stop();

      return;
    }

    if (checkIfInputIsValid()) {
      let attachments: Attachment[] | undefined;
      if (selectedFiles().length > 0) {
        setUploadProgress(undefined);
        const urls = await uploadFiles({
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
        attachments = urls
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

    if (!data.isFromTypebot) {
      return;
    }

    if (data.command === "setInputValue") {
      setInputValue(data.value);
    }
  };

  return (
    <div
      class={cx("typebot-input-form flex w-full gap-2 items-end", "max-w-full")}
    >
      <div
        class={cx(
          "relative typebot-input flex-col w-full",
          isDraggingOver() && "filter brightness-95",
        )}
        style={{
          "border-color": props.error ? " #FF4949" : "",
        }}
      >
        <Show when={recordingStatus() !== "started"}>
          <Show when={selectedFiles().length}>
            <div
              class="p-2 flex gap-2 border-gray-100 overflow-auto"
              style={{ "border-bottom-width": "1px" }}
            ></div>
          </Show>

          <div class={cx("flex justify-between", "items-end")}>
            {props.isLong ? (
              <Textarea
                name={props.name}
                ref={inputRef as HTMLTextAreaElement}
                onInput={handleInput}
                onKeyDown={submitIfCtrlEnter}
                value={inputValue()}
              />
            ) : (
              <ShortTextInput
                name={props.name}
                ref={inputRef as HTMLInputElement}
                onInput={handleInput}
                value={inputValue()}
              />
            )}
          </div>
        </Show>
      </div>
    </div>
  );
};
