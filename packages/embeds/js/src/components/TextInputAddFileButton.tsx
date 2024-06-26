import { Show } from 'solid-js'
import { Menu } from '@ark-ui/solid'
import { CameraIcon } from './icons/CameraIcon'
import { FileIcon } from './icons/FileIcon'
import { PictureIcon } from './icons/PictureIcon'
import { isMobile } from '@/utils/isMobileSignal'
import { PaperClipIcon } from './icons/PaperClipIcon'
import clsx from 'clsx'

type Props = {
  onNewFiles: (files: FileList) => void
  class?: string
}
export const TextInputAddFileButton = (props: Props) => {
  return (
    <>
      <input
        type="file"
        id="document-upload"
        multiple
        class="hidden"
        onChange={(e) => {
          if (!e.currentTarget.files) return
          props.onNewFiles(e.currentTarget.files)
        }}
      />
      <input
        type="file"
        id="photos-upload"
        accept="image/*"
        multiple
        class="hidden"
        onChange={(e) => {
          if (!e.currentTarget.files) return
          props.onNewFiles(e.currentTarget.files)
        }}
      />
      <Show when={isMobile()}>
        <input
          type="file"
          id="camera-upload"
          class="hidden"
          multiple
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            if (!e.currentTarget.files) return
            props.onNewFiles(e.currentTarget.files)
          }}
        />
      </Show>

      <Menu.Root>
        <Menu.Trigger
          class={clsx(
            'filter data-[state=open]:backdrop-brightness-90 hover:backdrop-brightness-95 transition rounded-md p-2 focus:outline-none',
            props.class
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
            <Show when={isMobile()}>
              <Menu.Item
                value="camera"
                class="p-2 filter hover:brightness-95 flex gap-3 items-center"
              >
                <CameraIcon class="w-4" />
                Camera
              </Menu.Item>
            </Show>
          </Menu.Content>
        </Menu.Positioner>
      </Menu.Root>
    </>
  )
}
