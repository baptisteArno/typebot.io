import { CloseIcon } from "@/components/icons/CloseIcon";
import { Progress } from "@ark-ui/solid";
import { isDefined } from "@typebot.io/lib/utils";
import {
  Match,
  Show,
  Switch,
  createEffect,
  createSignal,
  onCleanup,
} from "solid-js";
import { FilePreview } from "./FilePreview";

export const SelectedFile = (props: {
  file: File;
  uploadProgressPercent?: number;
  onRemoveClick: () => void;
}) => {
  return (
    <div class="relative group flex-shrink-0">
      <Switch>
        <Match when={props.file.type.startsWith("image")}>
          <img
            src={URL.createObjectURL(props.file)}
            alt={props.file.name}
            class="rounded-md object-cover w-[58px] h-[58px]"
          />
        </Match>
        <Match when={true}>
          <FilePreview file={props.file} />
        </Match>
      </Switch>

      <button
        class="absolute -right-2 p-0.5 -top-2 rounded-full bg-gray-200 text-black border border-gray-400 opacity-1 sm:opacity-0 group-hover:opacity-100 transition-opacity"
        on:click={props.onRemoveClick}
        aria-label="Remove attachment"
      >
        <CloseIcon class="w-4" />
      </button>
      <Show
        when={
          isDefined(props.uploadProgressPercent) &&
          props.uploadProgressPercent !== 100
        }
      >
        <UploadOverlay progressPercent={props.uploadProgressPercent} />
      </Show>
    </div>
  );
};

const UploadOverlay = (props: { progressPercent?: number }) => {
  const [progressPercent, setProgressPercent] = createSignal(
    props.progressPercent ?? 0,
  );

  let interval: NodeJS.Timer | undefined;

  createEffect(() => {
    if (props.progressPercent === 20) {
      const incrementProgress = () => {
        if (progressPercent() < 100) {
          setProgressPercent(
            (prev) => prev + (Math.floor(Math.random() * 10) + 1),
          );
        }
      };

      interval = setInterval(incrementProgress, 1000);
    }
  });

  onCleanup(() => {
    clearInterval(interval);
  });

  return (
    <div class="absolute w-full h-full inset-0 bg-black/20 rounded-md">
      <Progress.Root
        value={progressPercent()}
        class="flex items-center justify-center"
      >
        <Progress.Circle>
          <Progress.CircleTrack />
          <Progress.CircleRange />
        </Progress.Circle>
      </Progress.Root>
    </div>
  );
};
