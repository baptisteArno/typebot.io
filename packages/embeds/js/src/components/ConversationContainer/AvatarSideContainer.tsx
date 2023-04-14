import { createSignal, onCleanup, onMount } from 'solid-js'
import { isMobile } from '@/utils/isMobileSignal'
import { Avatar } from '../avatars/Avatar'

type Props = { hostAvatarSrc?: string; hideAvatar?: boolean }

export const AvatarSideContainer = (props: Props) => {
  let avatarContainer: HTMLDivElement | undefined
  const [top, setTop] = createSignal<number>(0)

  const resizeObserver = new ResizeObserver((entries) =>
    setTop(entries[0].target.clientHeight - (isMobile() ? 24 : 40))
  )

  onMount(() => {
    if (avatarContainer) {
      resizeObserver.observe(avatarContainer)
    }
  })

  onCleanup(() => {
    if (avatarContainer) {
      resizeObserver.unobserve(avatarContainer)
    }
  })

  return (
    <div
      ref={avatarContainer}
      class={
        'flex mr-2 mb-2 flex-shrink-0 items-center relative typebot-avatar-container ' +
        (isMobile() ? 'w-6' : 'w-10')
      }
    >
      <div
        class={
          'absolute mb-2 flex items-center top-0' +
          (isMobile() ? ' w-6 h-6' : ' w-10 h-10') +
          (props.hideAvatar ? ' opacity-0' : ' opacity-100')
        }
        style={{
          top: `${top()}px`,
          transition: 'top 350ms ease-out, opacity 250ms ease-out',
        }}
      >
        <Avatar initialAvatarSrc={props.hostAvatarSrc} />
      </div>
    </div>
  )
}
