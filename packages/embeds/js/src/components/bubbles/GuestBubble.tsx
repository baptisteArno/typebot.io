import { createSignal, For, Show } from 'solid-js'
import { Avatar } from '../avatars/Avatar'
import { isMobile } from '@/utils/isMobileSignal'
import { Answer } from '@/types'
import { Modal } from '../Modal'
import { isNotEmpty } from '@typebot.io/lib'
import { FilePreview } from '@/features/blocks/inputs/fileUpload/components/FilePreview'
import clsx from 'clsx'

type Props = {
  message: Answer
  showAvatar: boolean
  avatarSrc?: string
  hasHostAvatar: boolean
}

export const GuestBubble = (props: Props) => {
  const [clickedImageSrc, setClickedImageSrc] = createSignal<string>()

  return (
    <div
      class="flex justify-end items-end animate-fade-in gap-2 guest-container"
      style={{
        'margin-left': props.hasHostAvatar
          ? isMobile()
            ? '28px'
            : '50px'
          : undefined,
      }}
    >
      <div class="flex flex-col gap-1 items-end">
        <Show when={(props.message.attachments ?? []).length > 0}>
          <div
            class={clsx(
              'flex gap-1 overflow-auto max-w-[350px]',
              isMobile() ? 'flex-wrap justify-end' : 'items-center'
            )}
          >
            <For
              each={props.message.attachments?.filter((attachment) =>
                attachment.type.startsWith('image')
              )}
            >
              {(attachment, idx) => (
                <img
                  src={attachment.url}
                  alt={`Attached image ${idx() + 1}`}
                  class={clsx(
                    'typebot-guest-bubble-image-attachment cursor-pointer',
                    props.message.attachments!.filter((attachment) =>
                      attachment.type.startsWith('image')
                    ).length > 1 && 'max-w-[90%]'
                  )}
                  onClick={() => setClickedImageSrc(attachment.url)}
                />
              )}
            </For>
          </div>
          <div
            class={clsx(
              'flex gap-1 overflow-auto max-w-[350px]',
              isMobile() ? 'flex-wrap justify-end' : 'items-center'
            )}
          >
            <For
              each={props.message.attachments?.filter(
                (attachment) => !attachment.type.startsWith('image')
              )}
            >
              {(attachment) => (
                <FilePreview
                  file={{
                    name: attachment.url.split('/').at(-1)!,
                  }}
                />
              )}
            </For>
          </div>
        </Show>
        <div
          class="p-[1px] whitespace-pre-wrap max-w-full typebot-guest-bubble flex flex-col"
          data-testid="guest-bubble"
        >
          <Show when={isNotEmpty(props.message.text)}>
            <span class="px-[15px] py-[7px]">{props.message.text}</span>
          </Show>
        </div>
      </div>

      <Modal
        isOpen={clickedImageSrc() !== undefined}
        onClose={() => setClickedImageSrc(undefined)}
      >
        <img
          src={clickedImageSrc()}
          alt="Attachment"
          style={{ 'border-radius': '6px' }}
        />
      </Modal>
      <Show when={props.showAvatar}>
        <Avatar initialAvatarSrc={props.avatarSrc} />
      </Show>
    </div>
  )
}
