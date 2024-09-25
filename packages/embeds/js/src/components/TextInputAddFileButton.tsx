import { isMobile } from "@/utils/isMobileSignal";
import { Menu } from "@ark-ui/solid";
import clsx from "clsx";
import { Match, Switch } from "solid-js";
import { FileIcon } from "./icons/FileIcon";
import { PaperClipIcon } from "./icons/PaperClipIcon";
import { PictureIcon } from "./icons/PictureIcon";

type Props = {
  onNewFiles: (files: FileList) => void;
  class?: string;
};
export const TextInputAddFileButton = (props: Props) => {
  return (
    <>
      <input
        type="file"
        id="document-upload"
        multiple
        class="hidden"
        onChange={(e) => {
          if (!e.currentTarget.files) return;
          props.onNewFiles(e.currentTarget.files);
        }}
      />
      <input
        type="file"
        id="photos-upload"
        accept="image/*, video/*"
        multiple
        class="hidden"
        onChange={(e) => {
          if (!e.currentTarget.files) return;
          props.onNewFiles(e.currentTarget.files);
        }}
      />

      <Switch>
        <Match when={isMobile()}>
          <label
            aria-label="Add attachments"
            for="document-upload"
            class={clsx(
              "filter data-[state=open]:backdrop-brightness-90 hover:backdrop-brightness-95 transition rounded-md p-2 focus:outline-none",
              props.class,
            )}
          >
            <PaperClipIcon class="w-5" />
          </label>
        </Match>
        <Match when={true}>
          <Menu.Root>
            <Menu.Trigger
              class={clsx(
                "filter data-[state=open]:backdrop-brightness-90 hover:backdrop-brightness-95 transition rounded-md p-2 focus:outline-none",
                props.class,
              )}
              aria-label="Add attachments"
            >
              <PaperClipIcon class="w-5" />
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content class="p-3 gap-2 focus:outline-none">
                <Menu.Item
                  value="document"
                  asChild={(props) => (
                    <label
                      {...props()}
                      for="document-upload"
                      class="p-2 filter hover:brightness-95 flex gap-3 items-center"
                    >
                      <FileIcon class="w-4" /> Document
                    </label>
                  )}
                />
                <Menu.Item
                  value="photos"
                  asChild={(props) => (
                    <label
                      {...props()}
                      for="photos-upload"
                      class="p-2 filter hover:brightness-95 flex gap-3 items-center"
                    >
                      <PictureIcon class="w-4" /> Photos & videos
                    </label>
                  )}
                />
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        </Match>
      </Switch>
    </>
  );
};
