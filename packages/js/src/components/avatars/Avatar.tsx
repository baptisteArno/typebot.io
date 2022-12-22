import { isMobile } from '@/utils/isMobileSignal'
import { Show } from 'solid-js'
import { DefaultAvatar } from './DefaultAvatar'

export const Avatar = (props: { avatarSrc?: string }) => (
  <Show when={props.avatarSrc !== ''}>
    <Show when={props.avatarSrc} keyed fallback={() => <DefaultAvatar />}>
      {(currentAvatarSrc) => (
        <figure
          class={
            'flex justify-center items-center rounded-full text-white relative animate-fade-in ' +
            (isMobile() ? 'w-6 h-6 text-sm' : 'w-10 h-10 text-xl')
          }
        >
          <img
            src={currentAvatarSrc}
            alt="Bot avatar"
            class="rounded-full object-cover w-full h-full"
          />
        </figure>
      )}
    </Show>
  </Show>
)
