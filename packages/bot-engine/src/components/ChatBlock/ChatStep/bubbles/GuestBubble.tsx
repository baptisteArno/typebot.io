import { Avatar } from 'components/avatars/Avatar'
import React from 'react'
import { CSSTransition } from 'react-transition-group'

interface Props {
  message: string
  showAvatar: boolean
  avatarSrc?: string
}

export const GuestBubble = ({
  message,
  showAvatar,
  avatarSrc,
}: Props): JSX.Element => {
  return (
    <CSSTransition classNames="bubble" timeout={1000}>
      <div className="flex justify-end mb-2 items-end">
        <span
          className="px-4 py-2 rounded-lg mr-2 whitespace-pre-wrap max-w-full typebot-guest-bubble"
          data-testid="guest-bubble"
        >
          {message}
        </span>
        {showAvatar && <Avatar avatarSrc={avatarSrc} />}
      </div>
    </CSSTransition>
  )
}
