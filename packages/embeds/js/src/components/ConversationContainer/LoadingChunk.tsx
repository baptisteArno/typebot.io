import { Theme } from '@typebot.io/schemas'
import { Show } from 'solid-js'
import { LoadingBubble } from '../bubbles/LoadingBubble'
import { AvatarSideContainer } from './AvatarSideContainer'
import { defaultHostAvatarIsEnabled } from '@typebot.io/schemas/features/typebot/theme/constants'

type Props = {
  theme: Theme
}

export const LoadingChunk = (props: Props) => (
  <div class="flex w-full typebot-loading-chunk">
    <div class="flex flex-col w-full min-w-0">
      <div class="flex gap-2">
        <Show
          when={
            props.theme.chat?.hostAvatar?.isEnabled ??
            defaultHostAvatarIsEnabled
          }
        >
          <AvatarSideContainer
            hostAvatarSrc={props.theme.chat?.hostAvatar?.url}
          />
        </Show>
        <LoadingBubble />
      </div>
    </div>
  </div>
)
