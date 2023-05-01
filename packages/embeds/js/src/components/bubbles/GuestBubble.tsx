import { Show } from 'solid-js'
import { Avatar } from '../avatars/Avatar'

type Props = {
  message: string
  showAvatar: boolean
  avatarSrc?: string
}

export const GuestBubble = (props: Props) => (
  <div
    class="flex justify-end items-end animate-fade-in gap-2 guest-container"
    style={{ 'margin-left': '50px' }}
  >
    <span
      class="px-4 py-2 whitespace-pre-wrap max-w-full typebot-guest-bubble"
      data-testid="guest-bubble"
    >
      {props.message}
    </span>
    <Show when={props.showAvatar}>
      <Avatar initialAvatarSrc={props.avatarSrc} />
    </Show>
  </div>
)
