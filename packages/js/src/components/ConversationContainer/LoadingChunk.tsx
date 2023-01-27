import { Theme } from 'models'
import { Show } from 'solid-js'
import { LoadingBubble } from '../bubbles/LoadingBubble'
import { AvatarSideContainer } from './AvatarSideContainer'

type Props = {
  theme: Theme
}

export const LoadingChunk = (props: Props) => (
  <div class="flex w-full">
    <div class="flex flex-col w-full min-w-0">
      <div class="flex">
        <Show when={props.theme.chat.hostAvatar?.isEnabled}>
          <AvatarSideContainer
            hostAvatarSrc={props.theme.chat.hostAvatar?.url}
          />
        </Show>
        <div
          class="flex-1"
          style={{
            'margin-right': props.theme.chat.guestAvatar?.isEnabled
              ? '50px'
              : '0.5rem',
          }}
        >
          <LoadingBubble />
        </div>
      </div>
    </div>
  </div>
)
