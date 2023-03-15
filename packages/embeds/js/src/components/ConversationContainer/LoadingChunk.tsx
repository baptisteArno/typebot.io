import { Theme } from '@typebot.io/schemas'
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
        <LoadingBubble />
      </div>
    </div>
  </div>
)
