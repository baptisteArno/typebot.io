import { Show } from 'solid-js'
import { isDefined } from 'utils'
import { Avatar } from '../avatars/Avatar'

type Props = {
  message: string
  showAvatar: boolean
  avatarSrc?: string
}

export const GuestBubble = (props: Props) => (
  <div
    class="flex justify-end mb-2 items-end animate-fade-in"
    style={{ 'margin-left': '50px' }}
  >
    <span
      class="px-4 py-2 rounded-lg mr-2 whitespace-pre-wrap max-w-full typebot-guest-bubble cursor-pointer"
      data-testid="guest-bubble"
    >
      {props.message}
    </span>
    <Show when={isDefined(props.avatarSrc)}>
      <Avatar avatarSrc={props.avatarSrc} />
    </Show>
  </div>
)
