import React from 'react'
import { CSSTransition } from 'react-transition-group'

interface Props {
  message: string
}

export const GuestBubble = ({ message }: Props): JSX.Element => {
  return (
    <CSSTransition classNames="bubble" timeout={1000}>
      <div className="flex justify-end mb-2 items-center">
        <div className="flex items-end w-11/12 lg:w-4/6 justify-end">
          <div className="inline-flex px-4 py-2 rounded-lg mr-2 whitespace-pre-wrap max-w-full typebot-guest-bubble">
            {message}
          </div>
        </div>
      </div>
    </CSSTransition>
  )
}
