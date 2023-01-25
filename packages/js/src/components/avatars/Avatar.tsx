import { isMobile } from '@/utils/isMobileSignal'
import { createSignal, Show } from 'solid-js'
import { isNotEmpty } from 'utils'
import { DefaultAvatar } from './DefaultAvatar'

export const Avatar = (props: { initialAvatarSrc?: string }) => {
  const [avatarSrc] = createSignal(props.initialAvatarSrc)

  return (
    <Show
      when={isNotEmpty(avatarSrc())}
      keyed
      fallback={() => <DefaultAvatar />}
    >
      <figure
        class={
          'flex justify-center items-center rounded-full text-white relative animate-fade-in ' +
          (isMobile() ? 'w-6 h-6 text-sm' : 'w-10 h-10 text-xl')
        }
      >
        <img
          src={avatarSrc()}
          alt="Bot avatar"
          class="rounded-full object-cover w-full h-full"
        />
      </figure>
    </Show>
  )
}
